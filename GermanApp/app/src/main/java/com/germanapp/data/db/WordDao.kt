package com.germanapp.data.db

import androidx.room.*
import com.germanapp.data.model.Theme
import com.germanapp.data.model.Word
import kotlinx.coroutines.flow.Flow

@Dao
interface WordDao {
    @Query("SELECT * FROM themes ORDER BY name")
    fun getAllThemes(): Flow<List<Theme>>

    @Query("SELECT * FROM themes WHERE id = :id")
    suspend fun getTheme(id: Long): Theme?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTheme(theme: Theme): Long

    @Delete
    suspend fun deleteTheme(theme: Theme)

    @Query("SELECT * FROM words WHERE themeId = :themeId")
    fun getWordsForTheme(themeId: Long): Flow<List<Word>>

    @Query("SELECT * FROM words WHERE themeId = :themeId")
    suspend fun getWordsForThemeSync(themeId: Long): List<Word>

    @Query("SELECT * FROM words WHERE id = :id")
    suspend fun getWord(id: Long): Word?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWord(word: Word): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWords(words: List<Word>)

    @Update
    suspend fun updateWord(word: Word)

    @Delete
    suspend fun deleteWord(word: Word)

    @Query("UPDATE words SET mastered = :mastered WHERE id = :id")
    suspend fun setMastered(id: Long, mastered: Boolean)

    @Query("UPDATE words SET genderMastered = :mastered WHERE id = :id")
    suspend fun setGenderMastered(id: Long, mastered: Boolean)

    @Query("UPDATE words SET pluralMastered = :mastered WHERE id = :id")
    suspend fun setPluralMastered(id: Long, mastered: Boolean)
}
