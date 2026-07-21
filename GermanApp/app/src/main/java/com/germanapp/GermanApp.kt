package com.germanapp

import android.app.Application
import com.germanapp.data.db.AppDatabase

class GermanApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.getInstance(this) }
}
