package com.foodrescue.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodrescue.entity.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class SupabaseJwtService {

    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserPrincipal parseToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        try {
            // If secret is configured and not blank, verify signature
            if (jwtSecret != null && !jwtSecret.isBlank()) {
                Claims claims = Jwts.parser()
                        .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                UUID userId = UUID.fromString(claims.getSubject());
                String email = claims.get("email", String.class);
                UserRole role = UserRole.PUBLIC;

                Object userMetadataObj = claims.get("user_metadata");
                if (userMetadataObj != null) {
                    JsonNode node = objectMapper.valueToTree(userMetadataObj);
                    if (node.has("role")) {
                        role = UserRole.fromValue(node.get("role").asText());
                    }
                }

                return UserPrincipal.builder()
                        .id(userId)
                        .email(email)
                        .role(role)
                        .build();
            }

            // Fallback: decode JWT payload without verification for development/testing
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                JsonNode payload = objectMapper.readTree(payloadJson);

                if (payload.has("sub")) {
                    UUID userId = UUID.fromString(payload.get("sub").asText());
                    String email = payload.has("email") ? payload.get("email").asText() : null;
                    UserRole role = UserRole.PUBLIC;

                    if (payload.has("user_metadata") && payload.get("user_metadata").has("role")) {
                        role = UserRole.fromValue(payload.get("user_metadata").get("role").asText());
                    }

                    return UserPrincipal.builder()
                            .id(userId)
                            .email(email)
                            .role(role)
                            .build();
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to parse Supabase JWT: {}", ex.getMessage());
        }

        return null;
    }
}
