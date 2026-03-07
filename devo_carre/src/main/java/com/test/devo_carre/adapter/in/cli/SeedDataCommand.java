package com.test.devo_carre.adapter.in.cli;

import com.test.devo_carre.application.service.SeedDataService;
import org.springframework.stereotype.Component;
import picocli.CommandLine.Command;
import picocli.CommandLine.Option;

@Component
@Command(
        name = "seed-data",
        description = "Seed demo data (rooms, events, seats).",
        mixinStandardHelpOptions = true
)
public class SeedDataCommand implements Runnable {

    private final SeedDataService seedDataService;

    @Option(names = "--force", description = "Insert demo data even if events already exist")
    boolean force;

    public SeedDataCommand(SeedDataService seedDataService) {
        this.seedDataService = seedDataService;
    }

    @Override
    public void run() {
        seedDataService.seedDemoData(force);
    }
}
