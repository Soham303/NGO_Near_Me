package com.foodrescue.service;

import com.foodrescue.entity.HotelEntity;
import com.foodrescue.entity.NgoEntity;
import com.foodrescue.entity.TagEntity;
import com.foodrescue.entity.VolunteerEntity;
import com.foodrescue.repository.HotelRepository;
import com.foodrescue.repository.NgoRepository;
import com.foodrescue.repository.TagRepository;
import com.foodrescue.repository.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final HotelRepository hotelRepository;
    private final NgoRepository ngoRepository;
    private final VolunteerRepository volunteerRepository;
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<HotelEntity> getHotels() {
        return hotelRepository.findAll();
    }

    @Transactional(readOnly = true)
    public HotelEntity getHotelById(UUID id) {
        return hotelRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public HotelEntity getHotelBySlug(String slug) {
        return hotelRepository.findBySlug(slug).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<NgoEntity> getNgos() {
        return ngoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public NgoEntity getNgoById(UUID id) {
        return ngoRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<VolunteerEntity> getVolunteers() {
        return volunteerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<VolunteerEntity> getVolunteersByNgo(UUID ngoId) {
        return volunteerRepository.findByNgoId(ngoId);
    }

    @Transactional(readOnly = true)
    public List<TagEntity> getTags() {
        return tagRepository.findByActiveTrue();
    }
}
