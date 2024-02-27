package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.responses.ReportResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface StorageService {
    public String uploadReportToFileSystem(String userId,MultipartFile file) throws IOException;
    public byte[] downloadReportFromFileSystem(String userId) throws IOException;

    List<ReportResponse> reportStatus(String affiliationCode,int year);
    List<ReportResponse> reportStatusToSupervisor(String userId,int year);
}
