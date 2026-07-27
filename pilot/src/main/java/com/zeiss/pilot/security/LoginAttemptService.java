package com.zeiss.pilot.security;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

@Service
public class LoginAttemptService {

    private static final int MAX_TENTATIVAS = 5;
    private static final Duration JANELA = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket novoBucket() {
        Bandwidth limite = Bandwidth.builder()
                .capacity(MAX_TENTATIVAS)
                .refillGreedy(MAX_TENTATIVAS, JANELA)
                .build();
        return Bucket.builder().addLimit(limite).build();
    }

    public boolean estaBloqueado(String email) {
        if (email == null) {
            return false;
        }
        Bucket bucket = buckets.get(email.toLowerCase());
        return bucket != null && bucket.getAvailableTokens() <= 0;
    }

    public void registrarFalha(String email) {
        if (email == null) {
            return;
        }
        Bucket bucket = buckets.computeIfAbsent(email.toLowerCase(), k -> novoBucket());
        bucket.tryConsume(1);
    }

    public void resetar(String email) {
        if (email == null) {
            return;
        }
        buckets.remove(email.toLowerCase());
    }
}
