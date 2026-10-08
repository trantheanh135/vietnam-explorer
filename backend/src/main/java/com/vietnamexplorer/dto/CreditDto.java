package com.vietnamexplorer.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Who made a piece of media and under which licence (e.g. a Wikimedia Commons video). */
public record CreditDto(
        @Size(max = 600) @Pattern(regexp = "https://\\S+", message = "phải là liên kết https") String page,
        @Size(max = 200) String author,
        @Size(max = 80) String license
) {
}
