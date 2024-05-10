package com.pfa.pmastery.app.security;

import com.pfa.pmastery.app.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@EnableWebSecurity
public class WebSecurity extends WebSecurityConfigurerAdapter {
    private final UserService userDetailsService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    public WebSecurity(UserService userDetailsService,
                       BCryptPasswordEncoder bCryptPasswordEncoder) {
        this.userDetailsService = userDetailsService;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
                .cors().and()
                .csrf().disable()
                .authorizeRequests()
                .antMatchers(HttpMethod.POST,SecurityConstants.PFE_URL, SecurityConstants.USER_URL)
                .permitAll()
                .antMatchers(HttpMethod.GET, SecurityConstants.PFE_URL+"/user/{userId}").permitAll()
                .antMatchers("/v2/api-docs",
                        "/swagger-resources/**",
                        "/ws/**",
                        "/user/pfe/{pfeId}",
                        "/user/{userId}",
                        "/soutnance/getAllSoutnancesToSupervisors/{userId}",
                        "/soutnance/getAllSoutnances",
                        "/soutnance/getAllSoutnancesJuryToSupervisors/{userId}",
                        "/soutnance/hasSoutnance/**",
                        "/pfe/{pfeId}",
                        "/pfe/user/{userId}",
                        "/pfe/hasPFE",
                        "pfe/hasSupervisorEmail",
                        "/swagger-ui.html**",
                        "/webjars/**",
            "/user/allUsers",
			"/user/confirmEmail",
                        "/user/forgotPassword",
                        "/user/resetPassword",
                        "/user/chefDeFiliere/signature",
                        "/pfe/requestStageSheet",
                        "/demande/create",
                        "/demande/hasDemand",
                        "/image",
                        "/send-pdf"
                )
                .permitAll()
                .anyRequest().authenticated()
                .and()
                .addFilter(getAuthenticationFilter())
                .addFilter(new AuthorizationFilter(authenticationManager()))
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }

    protected com.pfa.pmastery.app.security.AuthenticationFilter getAuthenticationFilter() throws Exception {
        final com.pfa.pmastery.app.security.AuthenticationFilter filter = new com.pfa.pmastery.app.security.AuthenticationFilter(authenticationManager());
        filter.setFilterProcessesUrl("/api/users/login");
        return filter;
    }
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(bCryptPasswordEncoder);
    }
}
