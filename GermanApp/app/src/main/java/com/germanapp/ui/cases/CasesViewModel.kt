package com.germanapp.ui.cases

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.germanapp.GermanApp
import com.germanapp.data.model.CaseExample
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class CasesViewModel(application: Application) : AndroidViewModel(application) {
    private val db = (application as GermanApp).database
    private val caseDao = db.caseDao()

    private val _themes = MutableLiveData<List<String>>(emptyList())
    val themes: LiveData<List<String>> = _themes

    private val _selectedTheme = MutableLiveData("")
    val selectedTheme: LiveData<String> = _selectedTheme

    private val _examples = MutableLiveData<List<CaseExample>>(emptyList())
    val examples: LiveData<List<CaseExample>> = _examples

    private val _currentIndex = MutableLiveData(0)
    val currentIndex: LiveData<Int> = _currentIndex

    private val _score = MutableLiveData(0)
    val score: LiveData<Int> = _score

    private val _totalAnswered = MutableLiveData(0)
    val totalAnswered: LiveData<Int> = _totalAnswered

    val defaultArticles = listOf("der", "die", "das", "den", "dem", "des")

    init {
        viewModelScope.launch {
            caseDao.getAllThemes().collect { list ->
                _themes.value = list
                if (list.isNotEmpty() && _selectedTheme.value.orEmpty().isEmpty()) {
                    selectTheme(list.first())
                }
            }
        }
    }

    fun selectTheme(theme: String) {
        _selectedTheme.value = theme
        viewModelScope.launch {
            val examples = caseDao.getExamplesForTheme(theme).first()
            _examples.value = examples.shuffled()
            _currentIndex.value = 0
            _score.value = 0
            _totalAnswered.value = 0
        }
    }

    fun answer(article: String): Boolean {
        val ex = _examples.value?.getOrNull(_currentIndex.value ?: 0) ?: return false
        val correct = ex.correctArticle.equals(article, ignoreCase = true)
        if (correct) _score.value = (_score.value ?: 0) + 1
        _totalAnswered.value = (_totalAnswered.value ?: 0) + 1
        if ((_currentIndex.value ?: 0) < (_examples.value?.size ?: 0) - 1) {
            _currentIndex.value = (_currentIndex.value ?: 0) + 1
        }
        return correct
    }

    fun currentExample(): CaseExample? = _examples.value?.getOrNull(_currentIndex.value ?: 0)
    fun isComplete(): Boolean = (_totalAnswered.value ?: 0) >= (_examples.value?.size ?: 0) && (_examples.value?.isNotEmpty() == true)
}
