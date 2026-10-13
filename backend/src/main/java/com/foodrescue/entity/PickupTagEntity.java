package com.foodrescue.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pickup_tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupTagEntity {

    @EmbeddedId
    private PickupTagId id;
}
