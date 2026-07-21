package com.germanapp.data.db

import androidx.room.*
import com.germanapp.data.model.QuizQuestion
import kotlinx.coroutines.flow.Flow

@Dao
interface QuizDao {
    @Query("SELECT * FROM quiz_questions WHERE poolName = :pool ORDER BY RANDOM()")
    fun getQuestionsForPool(pool: String): Flow<List<QuizQuestion>>

    @Query("SELECT DISTINCT poolName FROM quiz_questions ORDER BY poolName")
    fun getAllPools(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertQuestions(questions: List<QuizQuestion>)

    @Query("DELETE FROM quiz_questions WHERE poolName = :pool")
    suspend fun deletePool(pool: String)

    @Query("SELECT COUNT(*) FROM quiz_questions")
    suspend fun count(): Int
}
