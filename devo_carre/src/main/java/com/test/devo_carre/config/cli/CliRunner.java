package com.test.devo_carre.config.cli;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import picocli.CommandLine;

import java.util.Arrays;

@Component
@Profile("cli")
public class CliRunner implements ApplicationRunner {

    private final CliRootCommand rootCommand;
    private final CommandLine.IFactory factory;

    public CliRunner(CliRootCommand rootCommand, CommandLine.IFactory factory) {
        this.rootCommand = rootCommand;
        this.factory = factory;
    }

    @Override
    public void run(ApplicationArguments args) {
        var commandArgs = Arrays.stream(args.getSourceArgs())
                .filter(arg -> !arg.startsWith("--spring."))
                .filter(arg -> !arg.startsWith("--management."))
                .toArray(String[]::new);

        var exitCode = new CommandLine(rootCommand, factory).execute(commandArgs);
        if (exitCode != 0) {
            throw new IllegalStateException("CLI execution failed with code " + exitCode);
        }
    }
}
