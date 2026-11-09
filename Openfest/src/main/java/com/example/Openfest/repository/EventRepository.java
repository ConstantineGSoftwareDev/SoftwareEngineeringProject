
package com.example.Openfest.repository;

import com.example.Openfest.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCreatorId(Long creatorId);

    List<Event> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :eventId")
    Optional<Event> findByIdForUpdate(@Param("eventId") Long eventId);
}
