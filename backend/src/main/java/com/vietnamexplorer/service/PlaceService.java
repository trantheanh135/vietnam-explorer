package com.vietnamexplorer.service;

import com.vietnamexplorer.dto.ImageDto;
import com.vietnamexplorer.dto.PlaceRequest;
import com.vietnamexplorer.dto.PlaceResponse;
import com.vietnamexplorer.exception.ApiException;
import com.vietnamexplorer.model.Place;
import com.vietnamexplorer.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository repository;
    private final UploadService uploads;
    private final VideoService videos;
    private final BlobStorage blob;

    private static final java.util.regex.Pattern YOUTUBE = java.util.regex.Pattern.compile(
            "^https://(?:www\\.|m\\.)?(?:youtube\\.com/(?:watch\\?(?:.*&)?v=|shorts/|embed/)|youtu\\.be/)([A-Za-z0-9_-]{11})(?:[?&#].*)?$");

    @Transactional(readOnly = true)
    public List<PlaceResponse> list(String category, boolean includeUnpublished) {
        List<Place> places;
        if (category == null || category.isBlank()) {
            places = includeUnpublished
                    ? repository.findAllByOrderBySortOrderAscCreatedAtAsc()
                    : repository.findByPublishedTrueOrderBySortOrderAscCreatedAtAsc();
        } else {
            places = includeUnpublished
                    ? repository.findByCategoryOrderBySortOrderAscCreatedAtAsc(category)
                    : repository.findByCategoryAndPublishedTrueOrderBySortOrderAscCreatedAtAsc(category);
        }
        return places.stream().map(includeUnpublished ? PlaceResponse::from : PlaceResponse::publicView).toList();
    }

    @Transactional(readOnly = true)
    public PlaceResponse get(String id, boolean includeUnpublished) {
        Place p = repository.findById(id)
                .filter(x -> includeUnpublished || x.isPublished())
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy địa điểm"));
        return includeUnpublished ? PlaceResponse.from(p) : PlaceResponse.publicView(p);
    }

    @Transactional
    public PlaceResponse create(PlaceRequest req) {
        checkCategoryRules(req);
        String id = req.id() != null ? req.id() : uniqueId(slugify(req.nameEn()));
        if (repository.existsById(id)) throw ApiException.conflict("Mã địa điểm \"" + id + "\" đã tồn tại");
        Place p = new Place();
        p.setId(id);
        p.setSortOrder(repository.maxSortOrder() + 1);
        apply(p, req);
        applyMedia(p, req);
        return PlaceResponse.from(repository.save(p));
    }

    @Transactional
    public PlaceResponse update(String id, PlaceRequest req) {
        checkCategoryRules(req);
        Place p = repository.findById(id).orElseThrow(() -> ApiException.notFound("Không tìm thấy địa điểm"));
        String oldImage = p.getImageSrc();
        String oldVideo = p.getVideoUrl();
        String oldAnimated = p.getAnimatedUrl();
        apply(p, req);
        applyMedia(p, req);
        repository.saveAndFlush(p);
        if (oldImage != null && !oldImage.equals(p.getImageSrc())) deleteUploadIfUnused(oldImage);
        if (oldVideo != null && !oldVideo.equals(p.getVideoUrl()) && blob.isOurs(oldVideo)) blob.delete(oldVideo);
        if (oldAnimated != null && !oldAnimated.equals(p.getAnimatedUrl()) && blob.isOurs(oldAnimated)) blob.delete(oldAnimated);
        return PlaceResponse.from(p);
    }

    @Transactional
    public void delete(String id) {
        Place p = repository.findById(id).orElseThrow(() -> ApiException.notFound("Không tìm thấy địa điểm"));
        repository.delete(p);
        repository.flush();
        if (p.getImageSrc() != null) deleteUploadIfUnused(p.getImageSrc());
        videos.deleteVideoOf(p);
    }

    /** Seed import keeps the given order and ids. */
    @Transactional
    public void importSeed(List<PlaceRequest> seed) {
        int order = 0;
        for (PlaceRequest req : seed) {
            Place p = new Place();
            p.setId(req.id() != null ? req.id() : uniqueId(slugify(req.nameEn())));
            p.setSortOrder(++order);
            apply(p, req);
            repository.save(p);
        }
    }

    // ------------------------------------------------------------------------------------------

    private void checkCategoryRules(PlaceRequest req) {
        if ("food".equals(req.category())) {
            if (isBlank(req.venue())) throw ApiException.badRequest("Bài review món ăn cần tên quán");
            if (req.rating() == null) throw ApiException.badRequest("Bài review món ăn cần điểm đánh giá (1–5)");
        }
    }

    private void apply(Place p, PlaceRequest r) {
        boolean food = "food".equals(r.category());
        p.setCategory(r.category());
        p.setRegion(r.region());
        p.setNameEn(r.nameEn().trim());
        p.setNameVi(r.nameVi().trim());
        p.setVenue(trimToNull(r.venue()));
        p.setAddress(trimToNull(r.address()));
        p.setArea(r.area().trim());
        p.setLat(r.lat());
        p.setLng(r.lng());
        p.setTags(food || r.tags() == null ? null : String.join(",", r.tags()));
        p.setDescEn(r.descEn().trim());
        p.setDescVi(r.descVi().trim());
        p.setTipEn(trimToNull(r.tipEn()));
        p.setTipVi(trimToNull(r.tipVi()));
        p.setRating(food ? roundHalf(r.rating()) : null);
        p.setPrice(food ? trimToNull(r.price()) : null);
        ImageDto img = r.image();
        boolean hasImage = img != null && !isBlank(img.src());
        p.setImageSrc(hasImage ? img.src().trim() : null);
        p.setImagePage(hasImage ? trimToNull(img.page()) : null);
        p.setImageAuthor(hasImage ? trimToNull(img.author()) : null);
        p.setImageLicense(hasImage ? trimToNull(img.license()) : null);
        p.setPublished(r.published() == null || r.published());
    }

    /**
     * Video: an MP4/WebM uploaded to our Blob store, or a YouTube link (stored as watch?v=ID).
     * Animated image: a GIF / animated WebP uploaded to our Blob store. Blank removes it.
     */
    private void applyMedia(Place p, PlaceRequest r) {
        String videoBefore = p.getVideoUrl();
        String video = trimToNull(r.videoUrl());
        if (video == null) {
            if (!"generating".equals(p.getVideoStatus())) {
                p.setVideoUrl(null);
                p.setVideoStatus(null);
                p.setVideoModel(null);
                p.setVideoError(null);
            }
        } else if (!video.equals(p.getVideoUrl())) {
            var yt = YOUTUBE.matcher(video);
            if (yt.matches()) {
                p.setVideoUrl("https://www.youtube.com/watch?v=" + yt.group(1));
                p.setVideoModel("youtube");
            } else if (blob.isOurs(video) && video.matches("(?i).+\\.(mp4|webm)$")) {
                p.setVideoUrl(video);
                p.setVideoModel("upload");
            } else {
                throw ApiException.badRequest("Video phải là tệp MP4/WebM đã tải lên hoặc link YouTube");
            }
            p.setVideoStatus("ready");
            p.setVideoError(null);
        }

        // Credit: replaced when one is sent; kept while the same video stays; cleared with the video.
        boolean videoChanged = !java.util.Objects.equals(videoBefore, p.getVideoUrl());
        if (p.getVideoUrl() == null) {
            setVideoCredit(p, null);
        } else if (r.videoCredit() != null) {
            setVideoCredit(p, r.videoCredit());
        } else if (videoChanged) {
            setVideoCredit(p, null);
        }

        String animated = trimToNull(r.animatedUrl());
        if (animated != null && !animated.equals(p.getAnimatedUrl())
                && !(blob.isOurs(animated) && animated.matches("(?i).+\\.(gif|webp)$"))) {
            throw ApiException.badRequest("Ảnh động phải là tệp GIF/WebP đã tải lên");
        }
        p.setAnimatedUrl(animated);
    }

    private static void setVideoCredit(Place p, com.vietnamexplorer.dto.CreditDto c) {
        p.setVideoPage(c == null ? null : trimToNull(c.page()));
        p.setVideoAuthor(c == null ? null : trimToNull(c.author()));
        p.setVideoLicense(c == null ? null : trimToNull(c.license()));
    }

    private void deleteUploadIfUnused(String src) {
        if (src.startsWith("uploads/") && repository.countByImageSrc(src) == 0) uploads.delete(src);
    }

    private String uniqueId(String base) {
        String id = base;
        for (int n = 2; repository.existsById(id); n++) id = base + "-" + n;
        return id;
    }

    /** "Phở Hà Nội!" -> "pho-ha-noi". */
    static String slugify(String text) {
        String s = Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd').replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (s.length() > 70) s = s.substring(0, 70).replaceAll("-$", "");
        return s.length() < 3 ? "place-" + s : s;
    }

    private static Double roundHalf(Double v) {
        return v == null ? null : Math.round(v * 2) / 2.0;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String trimToNull(String s) {
        return isBlank(s) ? null : s.trim();
    }
}
