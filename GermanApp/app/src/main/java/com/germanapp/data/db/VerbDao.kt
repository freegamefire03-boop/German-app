package com.germanapp.data.db

import androidx.room.*
import com.germanapp.data.model.Verb
import kotlinx.coroutines.flow.Flow

@Dao
interface VerbDao {
    @Query("SELECT * FROM verbs ORDER BY infinitive")
    fun getAllVerbs(): Flow<List<Verb>>

    @Query("SELECT * FROM verbs WHERE id = :id")
    suspend fun getVerb(id: Long): Verb?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVerb(verb: Verb): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertVerbs(verbs: List<Verb>)

    @Update
    suspend fun updateVerb(verb: Verb)

    @Delete
    suspend fun deleteVerb(verb: Verb)

    @Query("SELECT * FROM verbs WHERE mastered = 0 ORDER BY RANDOM() LIMIT 1")
    suspend fun getRandomUnmastered(): Verb?

    @Query("SELECT * FROM verbs ORDER BY RANDOM() LIMIT 1")
    suspend fun getRandom(): Verb?
}
