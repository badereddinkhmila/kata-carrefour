package com.test.devo_carre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DevoCarreApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevoCarreApplication.class, args);
    }

}
