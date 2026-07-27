package com.zeiss.pilot.security;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;

@Service
public class LoginAttemptService {

    private static final int MAX_TENTATIVAS = 5;
    private static final Duration JANELA = Duration.ofMinutes(15);

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket novoBucket() {
        Bandwidth limite = Bandwidth.classic(MAX_TENTATIVAS, Refill.intervally(MAX_TENTATIVAS, JANELA));
        return Bucket.builder().addLimit(limite).build();
    }

    public boolean estaBloqueado(String email) {
        if (email == null) {
            return false;
        }
        Bucket bucket = buckets.computeIfAbsent(email.toLowerCase(), k -> novoBucket());
        return bucket.getAvailableTokens() <= 0;
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
