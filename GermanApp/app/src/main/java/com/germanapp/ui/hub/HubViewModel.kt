package com.germanapp.ui.hub

import androidx.lifecycle.ViewModel

data class AppInfo(
    val id: String,
    val name: String,
    val description: String,
    val icon: String
)

class HubViewModel : ViewModel() {
    val apps = listOf(
        AppInfo("flashcards", "Karteikarten", "Vokabeln lernen mit Karteikarten", "F"),
        AppInfo("verbs", "Verben", "Verbkonjugation üben", "V"),
        AppInfo("qcm", "Quiz", "Multiple-Choice Quiz", "Q"),
        AppInfo("cases", "Fälle", "Grammatikfälle trainieren", "C")
    )
}
