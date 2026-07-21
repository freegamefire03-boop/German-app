package com.germanapp.ui.verbs

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.germanapp.GermanApp
import com.germanapp.data.model.Verb
import kotlinx.coroutines.launch

class VerbsViewModel(application: Application) : AndroidViewModel(application) {
    private val db = (application as GermanApp).database
    private val verbDao = db.verbDao()

    private val _verbs = MutableLiveData<List<Verb>>(emptyList())
    val verbs: LiveData<List<Verb>> = _verbs

    private val _currentIndex = MutableLiveData(0)
    val currentIndex: LiveData<Int> = _currentIndex

    var currentVerb: Verb? = null
        private set

    init {
        viewModelScope.launch {
            verbDao.getAllVerbs().collect { list ->
                _verbs.value = list
                if (list.isNotEmpty() && currentVerb == null) {
                    currentVerb = list[0]
                }
            }
        }
    }

    fun selectVerb(index: Int) {
        val list = _verbs.value ?: return
        if (index in list.indices) {
            _currentIndex.value = index
            currentVerb = list[index]
        }
    }

    fun toggleMastered() {
        currentVerb?.let { verb ->
            viewModelScope.launch {
                verbDao.updateVerb(verb.copy(mastered = !verb.mastered))
            }
        }
    }

    fun next() {
        selectVerb((_currentIndex.value ?: 0) + 1)
    }

    fun previous() {
        selectVerb((_currentIndex.value ?: 0) - 1)
    }
}
