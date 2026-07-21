package com.germanapp.ui.flashcards

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.germanapp.GermanApp
import com.germanapp.data.model.Theme
import com.germanapp.data.model.Word
import kotlinx.coroutines.launch

data class ThemeWithProgress(
    val theme: Theme,
    val masteredCount: Int,
    val totalCount: Int
)

class FlashcardsViewModel(application: Application) : AndroidViewModel(application) {
    private val db = (application as GermanApp).database
    private val wordDao = db.wordDao()

    private val _themes = MutableLiveData<List<ThemeWithProgress>>(emptyList())
    val themes: LiveData<List<ThemeWithProgress>> = _themes

    private val _selectedThemeWords = MutableLiveData<List<Word>>(emptyList())
    val selectedThemeWords: LiveData<List<Word>> = _selectedThemeWords

    private val _currentIndex = MutableLiveData(0)
    val currentIndex: LiveData<Int> = _currentIndex

    private val _isFlipped = MutableLiveData(false)
    val isFlipped: LiveData<Boolean> = _isFlipped

    private var currentWordList: List<Word> = emptyList()

    init {
        viewModelScope.launch {
            wordDao.getAllThemes().collect { themeList ->
                val withProgress = themeList.map { theme ->
                    val words = wordDao.getWordsForThemeSync(theme.id)
                    ThemeWithProgress(
                        theme = theme,
                        masteredCount = words.count { it.mastered },
                        totalCount = words.size
                    )
                }
                _themes.value = withProgress
            }
        }
    }

    fun selectTheme(themeId: Long) {
        viewModelScope.launch {
            val words = wordDao.getWordsForThemeSync(themeId)
            currentWordList = words.shuffled()
            _selectedThemeWords.value = currentWordList
            _currentIndex.value = 0
            _isFlipped.value = false
        }
    }

    fun flipCard() {
        _isFlipped.value = !(_isFlipped.value ?: false)
    }

    fun markMastered() {
        if (currentWordList.isEmpty()) return
        viewModelScope.launch {
            val word = currentWordList[_currentIndex.value ?: return@launch]
            wordDao.setMastered(word.id, true)
            advance()
        }
    }

    fun markNotMastered() {
        advance()
    }

    private fun advance() {
        val next = (_currentIndex.value ?: 0) + 1
        if (next < currentWordList.size) {
            _currentIndex.value = next
            _isFlipped.value = false
        }
    }

    fun isComplete(): Boolean = currentWordList.isNotEmpty() && (_currentIndex.value ?: 0) >= currentWordList.size
}
