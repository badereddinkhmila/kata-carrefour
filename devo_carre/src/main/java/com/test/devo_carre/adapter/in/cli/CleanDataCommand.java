package com.test.devo_carre.adapter.in.cli;

import com.test.devo_carre.application.service.CleanDataService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

@Component
@Command(
        name = "clean-data",
        description = "Delete all rows from application tables without dropping schema.",
        mixinStandardHelpOptions = true
)
public class CleanDataCommand implements Runnable {

    private final CleanDataService cleanDataService;

    @Option(names = "--confirm", description = "Required safety flag to execute cleanup")
    boolean confirm;

    public CleanDataCommand(CleanDataService cleanDataService) {
        this.cleanDataService = cleanDataService;
    }

    @Override
    public void run() {
        if (!confirm) {
            throw new IllegalArgumentException("Refusing to clean data without --confirm");
        }
        cleanDataService.cleanAllData();
    }
}
