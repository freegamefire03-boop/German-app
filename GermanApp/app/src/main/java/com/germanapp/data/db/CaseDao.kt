package com.germanapp.data.db

import androidx.room.*
import com.germanapp.data.model.CaseExample
import kotlinx.coroutines.flow.Flow

@Dao
interface CaseDao {
    @Query("SELECT * FROM case_examples WHERE themeName = :theme ORDER BY RANDOM()")
    fun getExamplesForTheme(theme: String): Flow<List<CaseExample>>

    @Query("SELECT DISTINCT themeName FROM case_examples ORDER BY themeName")
    fun getAllThemes(): Flow<List<String>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExamples(examples: List<CaseExample>)

    @Query("DELETE FROM case_examples WHERE themeName = :theme")
    suspend fun deleteTheme(theme: String)
}
