package com.pfa.pmastery.app.entities;

import javax.persistence.*;
import java.util.Date;

@Entity(name="reportData")
public class ReportData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;
    private String name;
    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;
    private String type;
    private String filePath;

    @OneToOne(targetEntity = PfeEntity.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "pfeId")
    private PfeEntity pfeEntity;

    @PrePersist
    protected void onCreate() {
        createdDate = new Date();
    }

    public ReportData() {
    }

    public ReportData(Long reportId, String name, String type, String filePath, PfeEntity pfeEntity) {
        this.reportId = reportId;
        this.name = name;
        this.type = type;
        this.filePath = filePath;
        this.pfeEntity = pfeEntity;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public PfeEntity getPfeEntity() {
        return pfeEntity;
    }

    public void setPfeEntity(PfeEntity pfeEntity) {
        this.pfeEntity = pfeEntity;
    }

    //Builder Class

    public static class Builder {
        private Long reportId;
        private String name;
        private String type;
        private String filePath;
        private PfeEntity pfeEntity;

        public Builder() {
        }

        public Builder reportId(Long reportId) {
            this.reportId = reportId;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public Builder pfeEntity(PfeEntity pfeEntity) {
            this.pfeEntity = pfeEntity;
            return this;
        }

        public ReportData build() {
            return new ReportData(reportId, name, type, filePath, pfeEntity);
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
