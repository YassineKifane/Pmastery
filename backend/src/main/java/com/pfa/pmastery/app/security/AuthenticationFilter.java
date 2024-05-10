package com.pfa.pmastery.app.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfa.pmastery.app.SpringApplicationContext;
import com.pfa.pmastery.app.requests.UserLoginRequest;
import com.pfa.pmastery.app.services.UserService;
import com.pfa.pmastery.app.shared.dto.UserDto;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;

public class AuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;

    public AuthenticationFilter(AuthenticationManager authenticationManager) {

        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res)
            throws AuthenticationException {
        try {

            UserLoginRequest creds = new ObjectMapper().readValue(req.getInputStream(), UserLoginRequest.class);

            UserService userService = (UserService) SpringApplicationContext.getBean("userServiceImpl");

            UserDto userDto = userService.getUserByEmailAndPassword(creds.getEmail(),creds.getPassword());

            if (userDto == null) {
                res.setStatus(HttpStatus.UNAUTHORIZED.value());
                //res.getWriter().write("E-mail ou mot de passe incorrect. Veuillez essayer de nouveau");

                // Create and return an error response as JSON
                ObjectMapper mapper = new ObjectMapper();
                String errorMessage = "E-mail ou mot de passe incorrect. Veuillez essayer de nouveau";
                String errorResponse = mapper.writeValueAsString(Collections.singletonMap("message", errorMessage));
                res.setContentType("application/json");
                res.getWriter().write(errorResponse);

                return null;
            }

            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(creds.getEmail(), creds.getPassword(), new ArrayList<>()));

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req,
                                            HttpServletResponse res,
                                            FilterChain chain,
                                            Authentication auth) throws IOException, ServletException {

        String userName = ((User) auth.getPrincipal()).getUsername();
        UserService userService = (UserService) SpringApplicationContext.getBean("userServiceImpl");
        UserDto userDto = userService.getUser(userName);

        String token = Jwts.builder()
                .setSubject(userName)
                .claim("id",userDto.getUserId())
                .claim("name",userDto.getFirstName()+" "+userDto.getLastName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SecurityConstants.TOKEN_SECRET )
                .compact();

        res.addHeader(SecurityConstants.HEADER_STRING, SecurityConstants.TOKEN_PREFIX + token);

        ObjectMapper mapper = new ObjectMapper();
        String userJson = mapper.writeValueAsString(userDto);
        res.addHeader("user", userJson);

        //res.addHeader("user_id", userDto.getUserId());
        //res.addHeader("role" , userDto.getRole());

        res.getWriter().print(userJson);
        //res.getWriter().write("{\n\"token\": \"" + token + "\" \n \"id\": \""+ userDto.getUserId() + "\"\n \"role\": \""+userDto.getRole() +"\"\n}");
    }

}
