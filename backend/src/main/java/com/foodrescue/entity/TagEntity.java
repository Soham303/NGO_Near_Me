package com.foodrescue.entity;

import com.foodrescue.entity.enums.TagKind;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagEntity {

    @Id
    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "label", nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false)
    private TagKind kind;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
