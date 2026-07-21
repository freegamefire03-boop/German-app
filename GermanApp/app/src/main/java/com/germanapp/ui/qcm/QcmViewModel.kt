package com.germanapp.ui.qcm

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.germanapp.GermanApp
import com.germanapp.data.model.QuizQuestion
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class QcmViewModel(application: Application) : AndroidViewModel(application) {
    private val db = (application as GermanApp).database
    private val quizDao = db.quizDao()

    private val _pools = MutableLiveData<List<String>>(emptyList())
    val pools: LiveData<List<String>> = _pools

    private val _selectedPool = MutableLiveData("")
    val selectedPool: LiveData<String> = _selectedPool

    private val _questions = MutableLiveData<List<ShuffledQuestion>>(emptyList())
    val questions: LiveData<List<ShuffledQuestion>> = _questions

    private val _currentQuestionIndex = MutableLiveData(0)
    val currentQuestionIndex: LiveData<Int> = _currentQuestionIndex

    private val _score = MutableLiveData(0)
    val score: LiveData<Int> = _score

    private val _totalAnswered = MutableLiveData(0)
    val totalAnswered: LiveData<Int> = _totalAnswered

    data class ShuffledQuestion(
        val question: String,
        val answers: List<String>,
        val correctAnswer: String
    )

    init {
        viewModelScope.launch {
            quizDao.getAllPools().collect { list ->
                _pools.value = list
                if (list.isNotEmpty() && _selectedPool.value.orEmpty().isEmpty()) {
                    selectPool(list.first())
                }
            }
        }
    }

    fun selectPool(pool: String) {
        _selectedPool.value = pool
        viewModelScope.launch {
            quizDao.getQuestionsForPool(pool).first().let { questionList ->
                _questions.value = questionList.map { q ->
                    val answers = listOf(q.correctAnswer, q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3)
                        .filter { it.isNotEmpty() }
                        .shuffled()
                    ShuffledQuestion(q.question, answers, q.correctAnswer)
                }
                _currentQuestionIndex.value = 0
                _score.value = 0
                _totalAnswered.value = 0
            }
        }
    }

    fun answer(answer: String): Boolean {
        val q = _questions.value?.getOrNull(_currentQuestionIndex.value ?: 0) ?: return false
        val correct = q.correctAnswer == answer
        if (correct) _score.value = (_score.value ?: 0) + 1
        _totalAnswered.value = (_totalAnswered.value ?: 0) + 1
        if ((_currentQuestionIndex.value ?: 0) < (_questions.value?.size ?: 0) - 1) {
            _currentQuestionIndex.value = (_currentQuestionIndex.value ?: 0) + 1
        }
        return correct
    }

    fun isComplete(): Boolean = (_totalAnswered.value ?: 0) >= (_questions.value?.size ?: 0) && (_questions.value?.isNotEmpty() == true)
    fun currentQuestion(): ShuffledQuestion? = _questions.value?.getOrNull(_currentQuestionIndex.value ?: 0)
}
