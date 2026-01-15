package in.sourabh.electrician.controller;

import in.sourabh.electrician.response.ApiResponse;
import in.sourabh.electrician.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");

        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Prompt is required", null));
        }

        String response = geminiService.getAiResponse(prompt);
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", response));
    }
}
