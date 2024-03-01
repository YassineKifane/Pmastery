package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.shared.dto.PfeDto;

import java.util.List;

public interface PfeService {
    List<PfeDto> getPfeByYear(int year , String code);
    List<PfeDto> getPfeWithStatus(int year , String code , boolean isApproved);
    PfeDto getPfeByPfeId(String pfeId);
    List<PfeDto> getPfeByUserId(String userId,String role);
    PfeDto updatePfe(String pfeId , PfeDto pfeDto);
    PfeDto approvePfeToSupervisors(String pfeId, List<String> userIds);
}
