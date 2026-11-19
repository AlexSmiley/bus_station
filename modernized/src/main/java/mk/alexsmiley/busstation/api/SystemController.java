package mk.alexsmiley.busstation.api;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    private final boolean databaseEnabled;

    public SystemController(@Value("${app.datasource.enabled:false}") boolean databaseEnabled) {
        this.databaseEnabled = databaseEnabled;
    }

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of(
                "application", "bus-station-api",
                "status", "UP",
                "database", databaseEnabled ? "configured" : "disabled"
        );
    }
}
