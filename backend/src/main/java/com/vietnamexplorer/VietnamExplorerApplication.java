package com.vietnamexplorer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class VietnamExplorerApplication {

    public static void main(String[] args) {
        SpringApplication.run(VietnamExplorerApplication.class, args);
    }
}
