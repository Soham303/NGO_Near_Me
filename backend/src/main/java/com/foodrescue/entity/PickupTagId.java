package com.foodrescue.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PickupTagId implements Serializable {

    @Column(name = "pickup_id", nullable = false)
    private UUID pickupId;

    @Column(name = "tag_code", nullable = false)
    private String tagCode;
}
