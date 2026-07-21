package com.germanapp.data.model

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "words",
    foreignKeys = [ForeignKey(
        entity = Theme::class,
        parentColumns = ["id"],
        childColumns = ["themeId"],
        onDelete = ForeignKey.CASCADE
    )],
    indices = [Index("themeId")]
)
data class Word(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val themeId: Long = 0,
    val german: String,
    val translation: String,
    val gender: String = "",
    val plural: String = "",
    val example: String = "",
    val mastered: Boolean = false,
    val genderMastered: Boolean = false,
    val pluralMastered: Boolean = false,
    val ease: Float = 2.5f,
    val interval: Int = 0,
    val nextReview: Long = System.currentTimeMillis()
)

@Entity(tableName = "themes")
data class Theme(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val totalCards: Int = 0
)

@Entity(tableName = "verbs")
data class Verb(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val infinitive: String,
    val translation: String,
    val praesensIch: String = "",
    val praesensDu: String = "",
    val praesensEr: String = "",
    val praesensWir: String = "",
    val praesensIhr: String = "",
    val praesensSie: String = "",
    val praeteritum: String = "",
    val partizip2: String = "",
    val mastered: Boolean = false
)

@Entity(tableName = "quiz_questions")
data class QuizQuestion(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val poolName: String,
    val question: String,
    val correctAnswer: String,
    val wrongAnswer1: String = "",
    val wrongAnswer2: String = "",
    val wrongAnswer3: String = ""
)

@Entity(tableName = "case_examples")
data class CaseExample(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val themeName: String,
    val part1: String,
    val part2: String,
    val correctArticle: String,
    val translation: String = ""
)
