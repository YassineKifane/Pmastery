package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.ReportData;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportDataRepository extends CrudRepository<ReportData,Long> {
    ReportData findByPfeEntityPfeId(String pfeId);
    boolean existsByPfeEntity(PfeEntity pfeEntity);
}
