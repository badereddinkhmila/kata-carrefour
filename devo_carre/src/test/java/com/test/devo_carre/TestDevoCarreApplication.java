package com.test.devo_carre;

import org.springframework.boot.SpringApplication;

public class TestDevoCarreApplication {

    public static void main(String[] args) {
        SpringApplication.from(DevoCarreApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
