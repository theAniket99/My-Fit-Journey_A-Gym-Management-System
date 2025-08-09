package com.gym_management_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map URL path /images/** to files inside uploads/ folder (external to static resources)
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:uploads/"); // <-- Path where files are saved
    }
}
