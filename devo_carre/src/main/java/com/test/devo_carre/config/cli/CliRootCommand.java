package com.test.devo_carre.config.cli;

import com.test.devo_carre.adapter.in.cli.SeedDataCommand;
import com.test.devo_carre.adapter.in.cli.CleanDataCommand;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;

@Component
@Command(
        name = "devo-carre-cli",
        description = "CLI commands for devo_carre",
        subcommands = {SeedDataCommand.class, CleanDataCommand.class},
        mixinStandardHelpOptions = true
)
public class CliRootCommand implements Runnable {
    @Override
    public void run() {}
}
