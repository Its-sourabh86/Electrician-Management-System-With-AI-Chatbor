package in.sourabh.electrician.serviceimpl;

import in.sourabh.electrician.service.GeminiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String getAiResponse(String prompt) {
        try {
            String systemContext = """
                    You are the intelligent assistant for the 'Electrician Management System'.
                    Your goal is to help two types of users:
                    1. Customers (Users): Who want to register, search for electricians, and book services.
                    2. Electricians: Who want to register, manage their profiles, and accept booking requests.

                    Platform Features:
                    - Registration: Separate flows for Users and Electricians.
                    - Dashboard: Users see electricians; Electricians see connection requests.
                    - Booking: Users can 'Book' an electrician. The electrician must 'Accept' or 'Reject' the request.

                    Please answer queries specifically about this platform. If the question is technical electrical advice, give a brief safety warning and suggest booking a professional through the app.

                    User Query:
                    """
                    + prompt;

            // Prepare the body
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "role", "user",
                                    "parts", List.of(
                                            Map.of("text", systemContext)))));

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make the call
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            Map response = responseEntity.getBody();
            if (response != null) {
                List<?> candidates = (List<?>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    List<?> parts = (List<?>) content.get("parts");
                    Map<?, ?> part = (Map<?, ?>) parts.get(0);
                    return (String) part.get("text");
                }
            }
            return "No response from AI.";
        } catch (HttpStatusCodeException e) {
            return "AI Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "AI Error: " + e.getMessage();
        }
    }
}
