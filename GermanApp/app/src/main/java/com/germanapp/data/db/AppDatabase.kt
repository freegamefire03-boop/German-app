package com.germanapp.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.germanapp.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [Word::class, Theme::class, Verb::class, QuizQuestion::class, CaseExample::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun wordDao(): WordDao
    abstract fun verbDao(): VerbDao
    abstract fun quizDao(): QuizDao
    abstract fun caseDao(): CaseDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "german_app.db"
                )
                    .addCallback(SeedCallback())
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    private class SeedCallback : Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                CoroutineScope(Dispatchers.IO).launch {
                    seedDatabase(database)
                }
            }
        }
    }
}

suspend fun seedDatabase(db: AppDatabase) {
    seedWords(db)
    seedVerbs(db)
    seedQuestions(db)
    seedCaseExamples(db)
}

private suspend fun seedWords(db: AppDatabase) {
    val themes = listOf(
        "Grundlagen", "Essen & Trinken", "Familie", "Farben", "Zahlen",
        "Haus & Wohnung", "Kleidung", "Körper", "Tiere", "Reisen",
        "Wetter", "Schule & Bildung", "Berufe", "Freizeit", "Natur",
        "Gefühle", "Einkaufen", "Verkehr"
    )

    val allWords = mapOf(
        "Grundlagen" to listOf(
            Word(german = "Hallo", translation = "Bonjour", gender = "das", plural = "-"),
            Word(german = "Tschüss", translation = "Au revoir", gender = "das", plural = "-"),
            Word(german = "Danke", translation = "Merci", gender = "das", plural = "-"),
            Word(german = "Bitte", translation = "S\'il vous plaît", gender = "die", plural = "-"),
            Word(german = "ja", translation = "oui", gender = "", plural = ""),
            Word(german = "nein", translation = "non", gender = "", plural = ""),
            Word(german = "vielleicht", translation = "peut-être", gender = "", plural = ""),
            Word(german = "der Mann", translation = "l\'homme", gender = "der", plural = "die Männer"),
            Word(german = "die Frau", translation = "la femme", gender = "die", plural = "die Frauen"),
            Word(german = "das Kind", translation = "l\'enfant", gender = "das", plural = "die Kinder"),
            Word(german = "gut", translation = "bon/bonne", gender = "", plural = ""),
            Word(german = "schlecht", translation = "mauvais", gender = "", plural = ""),
            Word(german = "groß", translation = "grand", gender = "", plural = ""),
            Word(german = "klein", translation = "petit", gender = "", plural = ""),
            Word(german = "schön", translation = "beau/belle", gender = "", plural = ""),
            Word(german = "neu", translation = "nouveau/nouvelle", gender = "", plural = "")
        ),
        "Essen & Trinken" to listOf(
            Word(german = "das Wasser", translation = "l\'eau (f)", gender = "das", plural = "-"),
            Word(german = "der Kaffee", translation = "le café", gender = "der", plural = "die Kaffees"),
            Word(german = "der Tee", translation = "le thé", gender = "der", plural = "die Tees"),
            Word(german = "die Milch", translation = "le lait", gender = "die", plural = "-"),
            Word(german = "das Bier", translation = "la bière", gender = "das", plural = "die Biere"),
            Word(german = "der Wein", translation = "le vin", gender = "der", plural = "die Weine"),
            Word(german = "das Brot", translation = "le pain", gender = "das", plural = "die Brote"),
            Word(german = "der Käse", translation = "le fromage", gender = "der", plural = "die Käse"),
            Word(german = "der Apfel", translation = "la pomme", gender = "der", plural = "die Äpfel"),
            Word(german = "die Banane", translation = "la banane", gender = "die", plural = "die Bananen"),
            Word(german = "das Ei", translation = "l\'œuf (m)", gender = "das", plural = "die Eier"),
            Word(german = "der Fisch", translation = "le poisson", gender = "der", plural = "die Fische"),
            Word(german = "das Fleisch", translation = "la viande", gender = "das", plural = "die Fleische"),
            Word(german = "der Reis", translation = "le riz", gender = "der", plural = "-"),
            Word(german = "der Salat", translation = "la salade", gender = "der", plural = "die Salate"),
            Word(german = "die Suppe", translation = "la soupe", gender = "die", plural = "die Suppen")
        ),
        "Familie" to listOf(
            Word(german = "der Vater", translation = "le père", gender = "der", plural = "die Väter"),
            Word(german = "die Mutter", translation = "la mère", gender = "die", plural = "die Mütter"),
            Word(german = "der Bruder", translation = "le frère", gender = "der", plural = "die Brüder"),
            Word(german = "die Schwester", translation = "la sœur", gender = "die", plural = "die Schwestern"),
            Word(german = "der Sohn", translation = "le fils", gender = "der", plural = "die Söhne"),
            Word(german = "die Tochter", translation = "la fille", gender = "die", plural = "die Töchter"),
            Word(german = "der Opa", translation = "le grand-père", gender = "der", plural = "die Opas"),
            Word(german = "die Oma", translation = "la grand-mère", gender = "die", plural = "die Omas"),
            Word(german = "der Onkel", translation = "l\'oncle (m)", gender = "der", plural = "die Onkel"),
            Word(german = "die Tante", translation = "la tante", gender = "die", plural = "die Tanten"),
            Word(german = "der Cousin", translation = "le cousin", gender = "der", plural = "die Cousins"),
            Word(german = "die Cousine", translation = "la cousine", gender = "die", plural = "die Cousinen")
        ),
        "Farben" to listOf(
            Word(german = "rot", translation = "rouge", gender = "", plural = ""),
            Word(german = "blau", translation = "bleu", gender = "", plural = ""),
            Word(german = "grün", translation = "vert", gender = "", plural = ""),
            Word(german = "gelb", translation = "jaune", gender = "", plural = ""),
            Word(german = "weiß", translation = "blanc/blanche", gender = "", plural = ""),
            Word(german = "schwarz", translation = "noir", gender = "", plural = ""),
            Word(german = "grau", translation = "gris", gender = "", plural = ""),
            Word(german = "braun", translation = "marron", gender = "", plural = ""),
            Word(german = "orange", translation = "orange", gender = "", plural = ""),
            Word(german = "lila", translation = "violet", gender = "", plural = ""),
            Word(german = "pink", translation = "rose", gender = "", plural = ""),
            Word(german = "bunt", translation = "coloré", gender = "", plural = "")
        ),
        "Zahlen" to listOf(
            Word(german = "null", translation = "zéro", gender = "", plural = ""),
            Word(german = "eins", translation = "un", gender = "", plural = ""),
            Word(german = "zwei", translation = "deux", gender = "", plural = ""),
            Word(german = "drei", translation = "trois", gender = "", plural = ""),
            Word(german = "vier", translation = "quatre", gender = "", plural = ""),
            Word(german = "fünf", translation = "cinq", gender = "", plural = ""),
            Word(german = "sechs", translation = "six", gender = "", plural = ""),
            Word(german = "sieben", translation = "sept", gender = "", plural = ""),
            Word(german = "acht", translation = "huit", gender = "", plural = ""),
            Word(german = "neun", translation = "neuf", gender = "", plural = ""),
            Word(german = "zehn", translation = "dix", gender = "", plural = ""),
            Word(german = "hundert", translation = "cent", gender = "", plural = ""),
            Word(german = "tausend", translation = "mille", gender = "", plural = "")
        ),
        "Haus & Wohnung" to listOf(
            Word(german = "das Haus", translation = "la maison", gender = "das", plural = "die Häuser"),
            Word(german = "die Wohnung", translation = "l\'appartement (m)", gender = "die", plural = "die Wohnungen"),
            Word(german = "das Zimmer", translation = "la chambre / la pièce", gender = "das", plural = "die Zimmer"),
            Word(german = "die Küche", translation = "la cuisine", gender = "die", plural = "die Küchen"),
            Word(german = "das Bad", translation = "la salle de bain", gender = "das", plural = "die Bäder"),
            Word(german = "das Wohnzimmer", translation = "le salon", gender = "das", plural = "die Wohnzimmer"),
            Word(german = "das Schlafzimmer", translation = "la chambre à coucher", gender = "das", plural = "die Schlafzimmer"),
            Word(german = "der Tisch", translation = "la table", gender = "der", plural = "die Tische"),
            Word(german = "der Stuhl", translation = "la chaise", gender = "der", plural = "die Stühle"),
            Word(german = "das Bett", translation = "le lit", gender = "das", plural = "die Betten"),
            Word(german = "die Tür", translation = "la porte", gender = "die", plural = "die Türen"),
            Word(german = "das Fenster", translation = "la fenêtre", gender = "das", plural = "die Fenster")
        ),
        "Kleidung" to listOf(
            Word(german = "der Mantel", translation = "le manteau", gender = "der", plural = "die Mäntel"),
            Word(german = "der Hut", translation = "le chapeau", gender = "der", plural = "die Hüte"),
            Word(german = "der Schuh", translation = "la chaussure", gender = "der", plural = "die Schuhe"),
            Word(german = "das Hemd", translation = "la chemise", gender = "das", plural = "die Hemden"),
            Word(german = "die Hose", translation = "le pantalon", gender = "die", plural = "die Hosen"),
            Word(german = "der Rock", translation = "la jupe", gender = "der", plural = "die Röcke"),
            Word(german = "das Kleid", translation = "la robe", gender = "das", plural = "die Kleider"),
            Word(german = "die Jacke", translation = "la veste", gender = "die", plural = "die Jacken"),
            Word(german = "der Pullover", translation = "le pull", gender = "der", plural = "die Pullover"),
            Word(german = "die Socke", translation = "la chaussette", gender = "die", plural = "die Socken"),
            Word(german = "der Handschuh", translation = "le gant", gender = "der", plural = "die Handschuhe")
        ),
        "Körper" to listOf(
            Word(german = "der Kopf", translation = "la tête", gender = "der", plural = "die Köpfe"),
            Word(german = "das Auge", translation = "l\'œil (m)", gender = "das", plural = "die Augen"),
            Word(german = "das Ohr", translation = "l\'oreille (f)", gender = "das", plural = "die Ohren"),
            Word(german = "die Nase", translation = "le nez", gender = "die", plural = "die Nasen"),
            Word(german = "der Mund", translation = "la bouche", gender = "der", plural = "die Münder"),
            Word(german = "die Hand", translation = "la main", gender = "die", plural = "die Hände"),
            Word(german = "der Fuß", translation = "le pied", gender = "der", plural = "die Füße"),
            Word(german = "das Bein", translation = "la jambe", gender = "das", plural = "die Beine"),
            Word(german = "der Arm", translation = "le bras", gender = "der", plural = "die Arme"),
            Word(german = "das Herz", translation = "le cœur", gender = "das", plural = "die Herzen"),
            Word(german = "der Rücken", translation = "le dos", gender = "der", plural = "die Rücken"),
            Word(german = "der Finger", translation = "le doigt", gender = "der", plural = "die Finger")
        ),
        "Tiere" to listOf(
            Word(german = "der Hund", translation = "le chien", gender = "der", plural = "die Hunde"),
            Word(german = "die Katze", translation = "le chat", gender = "die", plural = "die Katzen"),
            Word(german = "der Vogel", translation = "l\'oiseau (m)", gender = "der", plural = "die Vögel"),
            Word(german = "der Fisch", translation = "le poisson", gender = "der", plural = "die Fische"),
            Word(german = "das Pferd", translation = "le cheval", gender = "das", plural = "die Pferde"),
            Word(german = "die Kuh", translation = "la vache", gender = "die", plural = "die Kühe"),
            Word(german = "das Schwein", translation = "le cochon", gender = "das", plural = "die Schweine"),
            Word(german = "das Schaf", translation = "le mouton", gender = "das", plural = "die Schafe"),
            Word(german = "der Hase", translation = "le lièvre / le lapin", gender = "der", plural = "die Hasen"),
            Word(german = "die Maus", translation = "la souris", gender = "die", plural = "die Mäuse"),
            Word(german = "der Bär", translation = "l\'ours (m)", gender = "der", plural = "die Bären"),
            Word(german = "der Löwe", translation = "le lion", gender = "der", plural = "die Löwen")
        ),
        "Reisen" to listOf(
            Word(german = "der Bahnhof", translation = "la gare", gender = "der", plural = "die Bahnhöfe"),
            Word(german = "der Flughafen", translation = "l\'aéroport (m)", gender = "der", plural = "die Flughäfen"),
            Word(german = "das Hotel", translation = "l\'hôtel (m)", gender = "das", plural = "die Hotels"),
            Word(german = "der Zug", translation = "le train", gender = "der", plural = "die Züge"),
            Word(german = "das Flugzeug", translation = "l\'avion (m)", gender = "das", plural = "die Flugzeuge"),
            Word(german = "das Auto", translation = "la voiture", gender = "das", plural = "die Autos"),
            Word(german = "der Bus", translation = "le bus", gender = "der", plural = "die Busse"),
            Word(german = "das Ticket", translation = "le billet", gender = "das", plural = "die Tickets"),
            Word(german = "der Pass", translation = "le passeport", gender = "der", plural = "die Pässe"),
            Word(german = "der Koffer", translation = "la valise", gender = "der", plural = "die Koffer"),
            Word(german = "die Karte", translation = "la carte / le ticket", gender = "die", plural = "die Karten"),
            Word(german = "der Urlaub", translation = "les vacances (f pl)", gender = "der", plural = "die Urlaube")
        ),
        "Wetter" to listOf(
            Word(german = "das Wetter", translation = "le temps (météo)", gender = "das", plural = "-"),
            Word(german = "die Sonne", translation = "le soleil", gender = "die", plural = "die Sonnen"),
            Word(german = "der Regen", translation = "la pluie", gender = "der", plural = "die Regen"),
            Word(german = "der Schnee", translation = "la neige", gender = "der", plural = "-"),
            Word(german = "der Wind", translation = "le vent", gender = "der", plural = "die Winde"),
            Word(german = "die Wolke", translation = "le nuage", gender = "die", plural = "die Wolken"),
            Word(german = "der Blitz", translation = "l\'éclair (m)", gender = "der", plural = "die Blitze"),
            Word(german = "der Donner", translation = "le tonnerre", gender = "der", plural = "die Donner"),
            Word(german = "der Nebel", translation = "le brouillard", gender = "der", plural = "-"),
            Word(german = "warm", translation = "chaud", gender = "", plural = ""),
            Word(german = "kalt", translation = "froid", gender = "", plural = ""),
            Word(german = "die Temperatur", translation = "la température", gender = "die", plural = "die Temperaturen")
        ),
        "Schule & Bildung" to listOf(
            Word(german = "die Schule", translation = "l\'école (f)", gender = "die", plural = "die Schulen"),
            Word(german = "der Lehrer", translation = "le professeur (h)", gender = "der", plural = "die Lehrer"),
            Word(german = "die Lehrerin", translation = "la professeure", gender = "die", plural = "die Lehrerinnen"),
            Word(german = "der Schüler", translation = "l\'élève (m)", gender = "der", plural = "die Schüler"),
            Word(german = "die Schülerin", translation = "l\'élève (f)", gender = "die", plural = "die Schülerinnen"),
            Word(german = "das Buch", translation = "le livre", gender = "das", plural = "die Bücher"),
            Word(german = "der Stift", translation = "le stylo", gender = "der", plural = "die Stifte"),
            Word(german = "das Papier", translation = "le papier", gender = "das", plural = "die Papiere"),
            Word(german = "die Aufgabe", translation = "l\'exercice / le devoir", gender = "die", plural = "die Aufgaben"),
            Word(german = "die Prüfung", translation = "l\'examen (m)", gender = "die", plural = "die Prüfungen"),
            Word(german = "die Universität", translation = "l\'université (f)", gender = "die", plural = "die Universitäten"),
            Word(german = "das Studium", translation = "les études (f pl)", gender = "das", plural = "die Studien")
        ),
        "Berufe" to listOf(
            Word(german = "der Arzt", translation = "le médecin", gender = "der", plural = "die Ärzte"),
            Word(german = "die Ärztin", translation = "la médecin", gender = "die", plural = "die Ärztinnen"),
            Word(german = "der Ingenieur", translation = "l\'ingénieur (m)", gender = "der", plural = "die Ingenieure"),
            Word(german = "der Verkäufer", translation = "le vendeur", gender = "der", plural = "die Verkäufer"),
            Word(german = "die Krankenschwester", translation = "l\'infirmière (f)", gender = "die", plural = "die Krankenschwestern"),
            Word(german = "der Polizist", translation = "le policier", gender = "der", plural = "die Polizisten"),
            Word(german = "der Anwalt", translation = "l\'avocat (m)", gender = "der", plural = "die Anwälte"),
            Word(german = "der Koch", translation = "le cuisinier", gender = "der", plural = "die Köche"),
            Word(german = "der Fahrer", translation = "le conducteur", gender = "der", plural = "die Fahrer"),
            Word(german = "der Musiker", translation = "le musicien", gender = "der", plural = "die Musiker"),
            Word(german = "der Künstler", translation = "l\'artiste (m)", gender = "der", plural = "die Künstler"),
            Word(german = "der Student", translation = "l\'étudiant (m)", gender = "der", plural = "die Studenten")
        ),
        "Freizeit" to listOf(
            Word(german = "der Sport", translation = "le sport", gender = "der", plural = "die Sportarten"),
            Word(german = "das Spiel", translation = "le jeu", gender = "das", plural = "die Spiele"),
            Word(german = "der Film", translation = "le film", gender = "der", plural = "die Filme"),
            Word(german = "die Musik", translation = "la musique", gender = "die", plural = "die Musiken"),
            Word(german = "das Fernsehen", translation = "la télévision", gender = "das", plural = "-"),
            Word(german = "das Buch", translation = "le livre", gender = "das", plural = "die Bücher"),
            Word(german = "das Hobby", translation = "le hobby", gender = "das", plural = "die Hobbys"),
            Word(german = "der Ausflug", translation = "l\'excursion (f)", gender = "der", plural = "die Ausflüge"),
            Word(german = "das Konzert", translation = "le concert", gender = "das", plural = "die Konzerte"),
            Word(german = "der Urlaub", translation = "les vacances (f pl)", gender = "der", plural = "die Urlaube"),
            Word(german = "tanzen", translation = "danser", gender = "", plural = ""),
            Word(german = "singen", translation = "chanter", gender = "", plural = "")
        ),
        "Natur" to listOf(
            Word(german = "der Baum", translation = "l\'arbre (m)", gender = "der", plural = "die Bäume"),
            Word(german = "die Blume", translation = "la fleur", gender = "die", plural = "die Blumen"),
            Word(german = "der Wald", translation = "la forêt", gender = "der", plural = "die Wälder"),
            Word(german = "der Fluss", translation = "le fleuve / la rivière", gender = "der", plural = "die Flüsse"),
            Word(german = "der See", translation = "le lac", gender = "der", plural = "die Seen"),
            Word(german = "das Meer", translation = "la mer", gender = "das", plural = "die Meere"),
            Word(german = "der Berg", translation = "la montagne", gender = "der", plural = "die Berge"),
            Word(german = "die Wiese", translation = "le pré", gender = "die", plural = "die Wiesen"),
            Word(german = "der Himmel", translation = "le ciel", gender = "der", plural = "-"),
            Word(german = "die Erde", translation = "la terre", gender = "die", plural = "-"),
            Word(german = "die Sonne", translation = "le soleil", gender = "die", plural = "die Sonnen"),
            Word(german = "der Stern", translation = "l\'étoile (f)", gender = "der", plural = "die Sterne")
        ),
        "Gefühle" to listOf(
            Word(german = "glücklich", translation = "heureux/heureuse", gender = "", plural = ""),
            Word(german = "traurig", translation = "triste", gender = "", plural = ""),
            Word(german = "müde", translation = "fatigué", gender = "", plural = ""),
            Word(german = "hungrig", translation = "affamé", gender = "", plural = ""),
            Word(german = "durstig", translation = "assoiffé", gender = "", plural = ""),
            Word(german = "krank", translation = "malade", gender = "", plural = ""),
            Word(german = "gesund", translation = "en bonne santé", gender = "", plural = ""),
            Word(german = "ängstlich", translation = "apeuré", gender = "", plural = ""),
            Word(german = "aufgeregt", translation = "excité/enthousiaste", gender = "", plural = ""),
            Word(german = "ruhig", translation = "calme", gender = "", plural = ""),
            Word(german = "wütend", translation = "en colère", gender = "", plural = ""),
            Word(german = "die Liebe", translation = "l\'amour (m)", gender = "die", plural = "-")
        ),
        "Einkaufen" to listOf(
            Word(german = "der Laden", translation = "le magasin", gender = "der", plural = "die Läden"),
            Word(german = "der Markt", translation = "le marché", gender = "der", plural = "die Märkte"),
            Word(german = "das Geschäft", translation = "le commerce / la boutique", gender = "das", plural = "die Geschäfte"),
            Word(german = "der Preis", translation = "le prix", gender = "der", plural = "die Preise"),
            Word(german = "das Geld", translation = "l\'argent (m)", gender = "das", plural = "-"),
            Word(german = "der Euro", translation = "l\'euro (m)", gender = "der", plural = "die Euros"),
            Word(german = "die Tasche", translation = "le sac", gender = "die", plural = "die Taschen"),
            Word(german = "der Einkauf", translation = "les courses (f pl)", gender = "der", plural = "die Einkäufe"),
            Word(german = "die Kasse", translation = "la caisse", gender = "die", plural = "die Kassen"),
            Word(german = "der Rabatt", translation = "la réduction", gender = "der", plural = "die Rabatte"),
            Word(german = "das Angebot", translation = "l\'offre (f)", gender = "das", plural = "die Angebote"),
            Word(german = "die Quittung", translation = "le reçu", gender = "die", plural = "die Quittungen")
        ),
        "Verkehr" to listOf(
            Word(german = "die Straße", translation = "la rue", gender = "die", plural = "die Straßen"),
            Word(german = "der Weg", translation = "le chemin", gender = "der", plural = "die Wege"),
            Word(german = "die Ampel", translation = "le feu tricolore", gender = "die", plural = "die Ampeln"),
            Word(german = "das Schild", translation = "le panneau", gender = "das", plural = "die Schilder"),
            Word(german = "das Fahrrad", translation = "le vélo", gender = "das", plural = "die Fahrräder"),
            Word(german = "der Fußgänger", translation = "le piéton", gender = "der", plural = "die Fußgänger"),
            Word(german = "der Fahrer", translation = "le conducteur", gender = "der", plural = "die Fahrer"),
            Word(german = "die Haltestelle", translation = "l\'arrêt (m)", gender = "die", plural = "die Haltestellen"),
            Word(german = "die Kreuzung", translation = "le carrefour", gender = "die", plural = "die Kreuzungen"),
            Word(german = "die Brücke", translation = "le pont", gender = "die", plural = "die Brücken"),
            Word(german = "der Verkehr", translation = "la circulation", gender = "der", plural = "-"),
            Word(german = "langsam", translation = "lentement", gender = "", plural = "")
        )
    )

    themes.forEach { themeName ->
        val themeId = db.wordDao().insertTheme(Theme(name = themeName, totalCards = allWords[themeName]?.size ?: 0))
        allWords[themeName]?.let { words ->
            db.wordDao().insertWords(words.map { it.copy(themeId = themeId) })
        }
    }
}

private suspend fun seedVerbs(db: AppDatabase) {
    val verbs = listOf(
        Verb(infinitive = "sein", translation = "être", praesensIch = "bin", praesensDu = "bist", praesensEr = "ist", praesensWir = "sind", praesensIhr = "seid", praesensSie = "sind", praeteritum = "war", partizip2 = "gewesen"),
        Verb(infinitive = "haben", translation = "avoir", praesensIch = "habe", praesensDu = "hast", praesensEr = "hat", praesensWir = "haben", praesensIhr = "habt", praesensSie = "haben", praeteritum = "hatte", partizip2 = "gehabt"),
        Verb(infinitive = "werden", translation = "devenir", praesensIch = "werde", praesensDu = "wirst", praesensEr = "wird", praesensWir = "werden", praesensIhr = "werdet", praesensSie = "werden", praeteritum = "wurde", partizip2 = "geworden"),
        Verb(infinitive = "können", translation = "pouvoir", praesensIch = "kann", praesensDu = "kannst", praesensEr = "kann", praesensWir = "können", praesensIhr = "könnt", praesensSie = "können", praeteritum = "konnte", partizip2 = "gekonnt"),
        Verb(infinitive = "müssen", translation = "devoir", praesensIch = "muss", praesensDu = "musst", praesensEr = "muss", praesensWir = "müssen", praesensIhr = "müsst", praesensSie = "müssen", praeteritum = "musste", partizip2 = "gemusst"),
        Verb(infinitive = "sagen", translation = "dire", praesensIch = "sage", praesensDu = "sagst", praesensEr = "sagt", praesensWir = "sagen", praesensIhr = "sagt", praesensSie = "sagen", praeteritum = "sagte", partizip2 = "gesagt"),
        Verb(infinitive = "machen", translation = "faire", praesensIch = "mache", praesensDu = "machst", praesensEr = "macht", praesensWir = "machen", praesensIhr = "macht", praesensSie = "machen", praeteritum = "machte", partizip2 = "gemacht"),
        Verb(infinitive = "gehen", translation = "aller", praesensIch = "gehe", praesensDu = "gehst", praesensEr = "geht", praesensWir = "gehen", praesensIhr = "geht", praesensSie = "gehen", praeteritum = "ging", partizip2 = "gegangen"),
        Verb(infinitive = "kommen", translation = "venir", praesensIch = "komme", praesensDu = "kommst", praesensEr = "kommt", praesensWir = "kommen", praesensIhr = "kommt", praesensSie = "kommen", praeteritum = "kam", partizip2 = "gekommen"),
        Verb(infinitive = "sehen", translation = "voir", praesensIch = "sehe", praesensDu = "siehst", praesensEr = "sieht", praesensWir = "sehen", praesensIhr = "seht", praesensSie = "sehen", praeteritum = "sah", partizip2 = "gesehen"),
        Verb(infinitive = "essen", translation = "manger", praesensIch = "esse", praesensDu = "isst", praesensEr = "isst", praesensWir = "essen", praesensIhr = "esst", praesensSie = "essen", praeteritum = "aß", partizip2 = "gegessen"),
        Verb(infinitive = "trinken", translation = "boire", praesensIch = "trinke", praesensDu = "trinkst", praesensEr = "trinkt", praesensWir = "trinken", praesensIhr = "trinkt", praesensSie = "trinken", praeteritum = "trank", partizip2 = "getrunken"),
        Verb(infinitive = "nehmen", translation = "prendre", praesensIch = "nehme", praesensDu = "nimmst", praesensEr = "nimmt", praesensWir = "nehmen", praesensIhr = "nehmt", praesensSie = "nehmen", praeteritum = "nahm", partizip2 = "genommen"),
        Verb(infinitive = "geben", translation = "donner", praesensIch = "gebe", praesensDu = "gibst", praesensEr = "gibt", praesensWir = "geben", praesensIhr = "gebt", praesensSie = "geben", praeteritum = "gab", partizip2 = "gegeben"),
        Verb(infinitive = "sprechen", translation = "parler", praesensIch = "spreche", praesensDu = "sprichst", praesensEr = "spricht", praesensWir = "sprechen", praesensIhr = "sprecht", praesensSie = "sprechen", praeteritum = "sprach", partizip2 = "gesprochen"),
        Verb(infinitive = "lesen", translation = "lire", praesensIch = "lese", praesensDu = "liest", praesensEr = "liest", praesensWir = "lesen", praesensIhr = "lest", praesensSie = "lesen", praeteritum = "las", partizip2 = "gelesen"),
        Verb(infinitive = "schreiben", translation = "écrire", praesensIch = "schreibe", praesensDu = "schreibst", praesensEr = "schreibt", praesensWir = "schreiben", praesensIhr = "schreibt", praesensSie = "schreiben", praeteritum = "schrieb", partizip2 = "geschrieben"),
        Verb(infinitive = "fahren", translation = "conduire / aller (en véhicule)", praesensIch = "fahre", praesensDu = "fährst", praesensEr = "fährt", praesensWir = "fahren", praesensIhr = "fahrt", praesensSie = "fahren", praeteritum = "fuhr", partizip2 = "gefahren"),
        Verb(infinitive = "finden", translation = "trouver", praesensIch = "finde", praesensDu = "findest", praesensEr = "findet", praesensWir = "finden", praesensIhr = "findet", praesensSie = "finden", praeteritum = "fand", partizip2 = "gefunden"),
        Verb(infinitive = "helfen", translation = "aider", praesensIch = "helfe", praesensDu = "hilfst", praesensEr = "hilft", praesensWir = "helfen", praesensIhr = "helft", praesensSie = "helfen", praeteritum = "half", partizip2 = "geholfen"),
        Verb(infinitive = "wissen", translation = "savoir", praesensIch = "weiß", praesensDu = "weißt", praesensEr = "weiß", praesensWir = "wissen", praesensIhr = "wisst", praesensSie = "wissen", praeteritum = "wusste", partizip2 = "gewusst"),
        Verb(infinitive = "denken", translation = "penser", praesensIch = "denke", praesensDu = "denkst", praesensEr = "denkt", praesensWir = "denken", praesensIhr = "denkt", praesensSie = "denken", praeteritum = "dachte", partizip2 = "gedacht"),
        Verb(infinitive = "bringen", translation = "apporter", praesensIch = "bringe", praesensDu = "bringst", praesensEr = "bringt", praesensWir = "bringen", praesensIhr = "bringt", praesensSie = "bringen", praeteritum = "brachte", partizip2 = "gebracht"),
        Verb(infinitive = "laufen", translation = "courir", praesensIch = "laufe", praesensDu = "läufst", praesensEr = "läuft", praesensWir = "laufen", praesensIhr = "lauft", praesensSie = "laufen", praeteritum = "lief", partizip2 = "gelaufen"),
        Verb(infinitive = "schlafen", translation = "dormir", praesensIch = "schlafe", praesensDu = "schläfst", praesensEr = "schläft", praesensWir = "schlafen", praesensIhr = "schlaft", praesensSie = "schlafen", praeteritum = "schlief", partizip2 = "geschlafen"),
        Verb(infinitive = "wollen", translation = "vouloir", praesensIch = "will", praesensDu = "willst", praesensEr = "will", praesensWir = "wollen", praesensIhr = "wollt", praesensSie = "wollen", praeteritum = "wollte", partizip2 = "gewollt"),
        Verb(infinitive = "dürfen", translation = "avoir le droit / pouvoir", praesensIch = "darf", praesensDu = "darfst", praesensEr = "darf", praesensWir = "dürfen", praesensIhr = "dürft", praesensSie = "dürfen", praeteritum = "durfte", partizip2 = "gedurft"),
        Verb(infinitive = "sollen", translation = "devoir (recommandation)", praesensIch = "soll", praesensDu = "sollst", praesensEr = "soll", praesensWir = "sollen", praesensIhr = "sollt", praesensSie = "sollen", praeteritum = "sollte", partizip2 = "gesollt"),
        Verb(infinitive = "mögen", translation = "aimer", praesensIch = "mag", praesensDu = "magst", praesensEr = "mag", praesensWir = "mögen", praesensIhr = "mögt", praesensSie = "mögen", praeteritum = "mochte", partizip2 = "gemocht"),
        Verb(infinitive = "kaufen", translation = "acheter", praesensIch = "kaufe", praesensDu = "kaufst", praesensEr = "kauft", praesensWir = "kaufen", praesensIhr = "kauft", praesensSie = "kaufen", praeteritum = "kaufte", partizip2 = "gekauft")
    )
    db.verbDao().insertVerbs(verbs)
}

private suspend fun seedQuestions(db: AppDatabase) {
    val pools = mapOf(
        "Grundlagen" to listOf(
            QuizQuestion(poolName = "Grundlagen", question = "Hallo", correctAnswer = "Bonjour", wrongAnswer1 = "Au revoir", wrongAnswer2 = "Merci", wrongAnswer3 = "S\'il vous plaît"),
            QuizQuestion(poolName = "Grundlagen", question = "Tschüss", correctAnswer = "Au revoir", wrongAnswer1 = "Bonjour", wrongAnswer2 = "Merci", wrongAnswer3 = "Bonsoir"),
            QuizQuestion(poolName = "Grundlagen", question = "Danke", correctAnswer = "Merci", wrongAnswer1 = "S\'il vous plaît", wrongAnswer2 = "Pardon", wrongAnswer3 = "Bonjour"),
            QuizQuestion(poolName = "Grundlagen", question = "Bitte", correctAnswer = "S\'il vous plaît", wrongAnswer1 = "Merci", wrongAnswer2 = "De rien", wrongAnswer3 = "Pardon"),
            QuizQuestion(poolName = "Grundlagen", question = "ja", correctAnswer = "oui", wrongAnswer1 = "non", wrongAnswer2 = "peut-être", wrongAnswer3 = "merci"),
            QuizQuestion(poolName = "Grundlagen", question = "nein", correctAnswer = "non", wrongAnswer1 = "oui", wrongAnswer2 = "peut-être", wrongAnswer3 = "bonjour"),
            QuizQuestion(poolName = "Grundlagen", question = "der Mann", correctAnswer = "l\'homme", wrongAnswer1 = "la femme", wrongAnswer2 = "l\'enfant", wrongAnswer3 = "le garçon"),
            QuizQuestion(poolName = "Grundlagen", question = "die Frau", correctAnswer = "la femme", wrongAnswer1 = "l\'homme", wrongAnswer2 = "la fille", wrongAnswer3 = "la mère"),
            QuizQuestion(poolName = "Grundlagen", question = "das Kind", correctAnswer = "l\'enfant", wrongAnswer1 = "l\'homme", wrongAnswer2 = "la femme", wrongAnswer3 = "le bébé"),
            QuizQuestion(poolName = "Grundlagen", question = "groß", correctAnswer = "grand", wrongAnswer1 = "petit", wrongAnswer2 = "gros", wrongAnswer3 = "beau"),
            QuizQuestion(poolName = "Grundlagen", question = "klein", correctAnswer = "petit", wrongAnswer1 = "grand", wrongAnswer2 = "mauvais", wrongAnswer3 = "bon"),
            QuizQuestion(poolName = "Grundlagen", question = "schön", correctAnswer = "beau / belle", wrongAnswer1 = "grand", wrongAnswer2 = "nouveau", wrongAnswer3 = "bon")
        ),
        "Essen & Trinken" to listOf(
            QuizQuestion(poolName = "Essen & Trinken", question = "das Wasser", correctAnswer = "l\'eau", wrongAnswer1 = "le vin", wrongAnswer2 = "le lait", wrongAnswer3 = "la bière"),
            QuizQuestion(poolName = "Essen & Trinken", question = "der Kaffee", correctAnswer = "le café", wrongAnswer1 = "le thé", wrongAnswer2 = "le lait", wrongAnswer3 = "le vin"),
            QuizQuestion(poolName = "Essen & Trinken", question = "der Apfel", correctAnswer = "la pomme", wrongAnswer1 = "la banane", wrongAnswer2 = "l\'orange", wrongAnswer3 = "la poire"),
            QuizQuestion(poolName = "Essen & Trinken", question = "das Brot", correctAnswer = "le pain", wrongAnswer1 = "le fromage", wrongAnswer2 = "le riz", wrongAnswer3 = "la viande"),
            QuizQuestion(poolName = "Essen & Trinken", question = "die Milch", correctAnswer = "le lait", wrongAnswer1 = "l\'eau", wrongAnswer2 = "le café", wrongAnswer3 = "le thé")
        ),
        "Familie" to listOf(
            QuizQuestion(poolName = "Familie", question = "der Vater", correctAnswer = "le père", wrongAnswer1 = "la mère", wrongAnswer2 = "le frère", wrongAnswer3 = "l\'oncle"),
            QuizQuestion(poolName = "Familie", question = "die Mutter", correctAnswer = "la mère", wrongAnswer1 = "la sœur", wrongAnswer2 = "la tante", wrongAnswer3 = "la grand-mère"),
            QuizQuestion(poolName = "Familie", question = "der Bruder", correctAnswer = "le frère", wrongAnswer1 = "le fils", wrongAnswer2 = "l\'oncle", wrongAnswer3 = "le cousin"),
            QuizQuestion(poolName = "Familie", question = "die Schwester", correctAnswer = "la sœur", wrongAnswer1 = "la fille", wrongAnswer2 = "la cousine", wrongAnswer3 = "la tante")
        ),
        "Farben" to listOf(
            QuizQuestion(poolName = "Farben", question = "rot", correctAnswer = "rouge", wrongAnswer1 = "bleu", wrongAnswer2 = "vert", wrongAnswer3 = "jaune"),
            QuizQuestion(poolName = "Farben", question = "blau", correctAnswer = "bleu", wrongAnswer1 = "rouge", wrongAnswer2 = "vert", wrongAnswer3 = "noir"),
            QuizQuestion(poolName = "Farben", question = "grün", correctAnswer = "vert", wrongAnswer1 = "gris", wrongAnswer2 = "jaune", wrongAnswer3 = "marron"),
            QuizQuestion(poolName = "Farben", question = "gelb", correctAnswer = "jaune", wrongAnswer1 = "orange", wrongAnswer2 = "violet", wrongAnswer3 = "blanc"),
            QuizQuestion(poolName = "Farben", question = "schwarz", correctAnswer = "noir", wrongAnswer1 = "blanc", wrongAnswer2 = "gris", wrongAnswer3 = "marron"),
            QuizQuestion(poolName = "Farben", question = "weiß", correctAnswer = "blanc / blanche", wrongAnswer1 = "noir", wrongAnswer2 = "gris", wrongAnswer3 = "rose")
        ),
        "Zahlen" to listOf(
            QuizQuestion(poolName = "Zahlen", question = "eins", correctAnswer = "un", wrongAnswer1 = "deux", wrongAnswer2 = "trois", wrongAnswer3 = "cinq"),
            QuizQuestion(poolName = "Zahlen", question = "zwei", correctAnswer = "deux", wrongAnswer1 = "un", wrongAnswer2 = "trois", wrongAnswer3 = "quatre"),
            QuizQuestion(poolName = "Zahlen", question = "drei", correctAnswer = "trois", wrongAnswer1 = "deux", wrongAnswer2 = "quatre", wrongAnswer3 = "six"),
            QuizQuestion(poolName = "Zahlen", question = "zehn", correctAnswer = "dix", wrongAnswer1 = "neuf", wrongAnswer2 = "huit", wrongAnswer3 = "cent"),
            QuizQuestion(poolName = "Zahlen", question = "hundert", correctAnswer = "cent", wrongAnswer1 = "dix", wrongAnswer2 = "mille", wrongAnswer3 = "neuf")
        ),
        "Tiere" to listOf(
            QuizQuestion(poolName = "Tiere", question = "der Hund", correctAnswer = "le chien", wrongAnswer1 = "le chat", wrongAnswer2 = "l\'oiseau", wrongAnswer3 = "le cheval"),
            QuizQuestion(poolName = "Tiere", question = "die Katze", correctAnswer = "le chat", wrongAnswer1 = "la souris", wrongAnswer2 = "le chien", wrongAnswer3 = "le lapin"),
            QuizQuestion(poolName = "Tiere", question = "der Vogel", correctAnswer = "l\'oiseau", wrongAnswer1 = "le poisson", wrongAnswer2 = "le chien", wrongAnswer3 = "le cheval"),
            QuizQuestion(poolName = "Tiere", question = "die Kuh", correctAnswer = "la vache", wrongAnswer1 = "le cochon", wrongAnswer2 = "le mouton", wrongAnswer3 = "le cheval"),
            QuizQuestion(poolName = "Tiere", question = "der Löwe", correctAnswer = "le lion", wrongAnswer1 = "l\'ours", wrongAnswer2 = "le tigre", wrongAnswer3 = "le loup")
        ),
        "Reisen" to listOf(
            QuizQuestion(poolName = "Reisen", question = "der Bahnhof", correctAnswer = "la gare", wrongAnswer1 = "l\'aéroport", wrongAnswer2 = "la station", wrongAnswer3 = "l\'hôtel"),
            QuizQuestion(poolName = "Reisen", question = "der Flughafen", correctAnswer = "l\'aéroport", wrongAnswer1 = "la gare", wrongAnswer2 = "le port", wrongAnswer3 = "la station"),
            QuizQuestion(poolName = "Reisen", question = "der Zug", correctAnswer = "le train", wrongAnswer1 = "l\'avion", wrongAnswer2 = "le bus", wrongAnswer3 = "la voiture"),
            QuizQuestion(poolName = "Reisen", question = "das Flugzeug", correctAnswer = "l\'avion", wrongAnswer1 = "le train", wrongAnswer2 = "le bateau", wrongAnswer3 = "le bus"),
            QuizQuestion(poolName = "Reisen", question = "der Koffer", correctAnswer = "la valise", wrongAnswer1 = "le sac", wrongAnswer2 = "le passeport", wrongAnswer3 = "le billet")
        ),
        "Körper" to listOf(
            QuizQuestion(poolName = "Körper", question = "der Kopf", correctAnswer = "la tête", wrongAnswer1 = "le cou", wrongAnswer2 = "l\'épaule", wrongAnswer3 = "le dos"),
            QuizQuestion(poolName = "Körper", question = "das Auge", correctAnswer = "l\'œil", wrongAnswer1 = "l\'oreille", wrongAnswer2 = "le nez", wrongAnswer3 = "la bouche"),
            QuizQuestion(poolName = "Körper", question = "die Hand", correctAnswer = "la main", wrongAnswer1 = "le pied", wrongAnswer2 = "le bras", wrongAnswer3 = "le doigt"),
            QuizQuestion(poolName = "Körper", question = "das Herz", correctAnswer = "le cœur", wrongAnswer1 = "le poumon", wrongAnswer2 = "l\'estomac", wrongAnswer3 = "le foie")
        )
    )
    pools.forEach { (_, questions) ->
        db.quizDao().insertQuestions(questions)
    }
}

private suspend fun seedCaseExamples(db: AppDatabase) {
    val themes = mapOf(
        "Nominativ" to listOf(
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Mann ist groß.", correctArticle = "Der", translation = "L\'homme est grand."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Frau singt.", correctArticle = "Die", translation = "La femme chante."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Kind spielt.", correctArticle = "Das", translation = "L\'enfant joue."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Bäume sind hoch.", correctArticle = "Die", translation = "Les arbres sont hauts."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Hund bellt.", correctArticle = "Der", translation = "Le chien aboie."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Katze schläft.", correctArticle = "Die", translation = "Le chat dort."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Buch ist interessant.", correctArticle = "Das", translation = "Le livre est intéressant."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Äpfel sind rot.", correctArticle = "Die", translation = "Les pommes sont rouges."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Lehrer kommt.", correctArticle = "Der", translation = "Le professeur vient."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Sonne scheint.", correctArticle = "Die", translation = "Le soleil brille."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Wetter ist schön.", correctArticle = "Das", translation = "Le temps est beau."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Blumen blühen.", correctArticle = "Die", translation = "Les fleurs fleurissent."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Haus ist groß.", correctArticle = "Das", translation = "La maison est grande."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Freunde kommen.", correctArticle = "Die", translation = "Les amis viennent."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Tisch ist neu.", correctArticle = "Der", translation = "La table est neuve."),
            CaseExample(themeName = "Nominativ", part1 = "", part2 = "Milch ist kalt.", correctArticle = "Die", translation = "Le lait est froid.")
        ),
        "Akkusativ" to listOf(
            CaseExample(themeName = "Akkusativ", part1 = "Ich sehe ", part2 = " Mann.", correctArticle = "den", translation = "Je vois l\'homme."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich sehe ", part2 = " Frau.", correctArticle = "die", translation = "Je vois la femme."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich sehe ", part2 = " Kind.", correctArticle = "das", translation = "Je vois l\'enfant."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich kaufe ", part2 = " Apfel.", correctArticle = "den", translation = "J\'achète la pomme."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich habe ", part2 = " Buch.", correctArticle = "das", translation = "J\'ai le livre."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich trinke ", part2 = " Milch.", correctArticle = "die", translation = "Je bois le lait."),
            CaseExample(themeName = "Akkusativ", part1 = "Er liest ", part2 = " Zeitung.", correctArticle = "die", translation = "Il lit le journal."),
            CaseExample(themeName = "Akkusativ", part1 = "Sie mag ", part2 = " Hund.", correctArticle = "den", translation = "Elle aime le chien."),
            CaseExample(themeName = "Akkusativ", part1 = "Wir sehen ", part2 = " Film.", correctArticle = "den", translation = "Nous voyons le film."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich esse ", part2 = " Brot.", correctArticle = "das", translation = "Je mange le pain."),
            CaseExample(themeName = "Akkusativ", part1 = "Er hat ", part2 = " Auto.", correctArticle = "das", translation = "Il a la voiture."),
            CaseExample(themeName = "Akkusativ", part1 = "Sie kauft ", part2 = " Blumen.", correctArticle = "die", translation = "Elle achète des fleurs."),
            CaseExample(themeName = "Akkusativ", part1 = "Ich trage ", part2 = " Mantel.", correctArticle = "den", translation = "Je porte le manteau."),
            CaseExample(themeName = "Akkusativ", part1 = "Wir besuchen ", part2 = " Oma.", correctArticle = "die", translation = "Nous rendons visite à grand-mère."),
            CaseExample(themeName = "Akkusativ", part1 = "Er sucht ", part2 = " Schlüssel.", correctArticle = "den", translation = "Il cherche la clé.")
        ),
        "Dativ" to listOf(
            CaseExample(themeName = "Dativ", part1 = "Ich helfe ", part2 = " Mann.", correctArticle = "dem", translation = "J\'aide l\'homme."),
            CaseExample(themeName = "Dativ", part1 = "Ich helfe ", part2 = " Frau.", correctArticle = "der", translation = "J\'aide la femme."),
            CaseExample(themeName = "Dativ", part1 = "Ich helfe ", part2 = " Kind.", correctArticle = "dem", translation = "J\'aide l\'enfant."),
            CaseExample(themeName = "Dativ", part1 = "Wir danken ", part2 = " Lehrer.", correctArticle = "dem", translation = "Nous remercions le professeur."),
            CaseExample(themeName = "Dativ", part1 = "Sie gibt ", part2 = " Katze Futter.", correctArticle = "der", translation = "Elle donne à manger au chat."),
            CaseExample(themeName = "Dativ", part1 = "Er antwortet ", part2 = " Mutter.", correctArticle = "der", translation = "Il répond à la mère."),
            CaseExample(themeName = "Dativ", part1 = "Das Buch gehört ", part2 = " Mädchen.", correctArticle = "dem", translation = "Le livre appartient à la fille."),
            CaseExample(themeName = "Dativ", part1 = "Ich gebe ", part2 = " Hund Wasser.", correctArticle = "dem", translation = "Je donne de l\'eau au chien."),
            CaseExample(themeName = "Dativ", part1 = "Wir folgen ", part2 = " Weg.", correctArticle = "dem", translation = "Nous suivons le chemin."),
            CaseExample(themeName = "Dativ", part1 = "Sie hilft ", part2 = " Freundin.", correctArticle = "der", translation = "Elle aide son amie."),
            CaseExample(themeName = "Dativ", part1 = "Er dankt ", part2 = " Eltern.", correctArticle = "den", translation = "Il remercie les parents."),
            CaseExample(themeName = "Dativ", part1 = "Ich vertraue ", part2 = " Arzt.", correctArticle = "dem", translation = "Je fais confiance au médecin."),
            CaseExample(themeName = "Dativ", part1 = "Sie gehört ", part2 = " Familie.", correctArticle = "der", translation = "Elle appartient à la famille."),
            CaseExample(themeName = "Dativ", part1 = "Wir wohnen bei ", part2 = " Onkel.", correctArticle = "dem", translation = "Nous habitons chez l\'oncle."),
            CaseExample(themeName = "Dativ", part1 = "Er sitzt auf ", part2 = " Stuhl.", correctArticle = "dem", translation = "Il est assis sur la chaise.")
        ),
        "Genitiv" to listOf(
            CaseExample(themeName = "Genitiv", part1 = "Das ist das Haus ", part2 = " Mannes.", correctArticle = "des", translation = "C\'est la maison de l\'homme."),
            CaseExample(themeName = "Genitiv", part1 = "Das ist die Tasche ", part2 = " Frau.", correctArticle = "der", translation = "C\'est le sac de la femme."),
            CaseExample(themeName = "Genitiv", part1 = "Das ist das Spiel ", part2 = " Kindes.", correctArticle = "des", translation = "C\'est le jeu de l\'enfant."),
            CaseExample(themeName = "Genitiv", part1 = "Wegen ", part2 = " Regens bleiben wir zu Hause.", correctArticle = "des", translation = "À cause de la pluie, nous restons à la maison."),
            CaseExample(themeName = "Genitiv", part1 = "Trotz ", part2 = " Kälte gehen wir spazieren.", correctArticle = "der", translation = "Malgré le froid, nous allons nous promener."),
            CaseExample(themeName = "Genitiv", part1 = "Das ist der Name ", part2 = " Hotels.", correctArticle = "des", translation = "C\'est le nom de l\'hôtel."),
            CaseExample(themeName = "Genitiv", part1 = "Die Farbe ", part2 = " Himmels ist blau.", correctArticle = "des", translation = "La couleur du ciel est bleue."),
            CaseExample(themeName = "Genitiv", part1 = "Das Ende ", part2 = " Geschichte ist traurig.", correctArticle = "der", translation = "La fin de l\'histoire est triste."),
            CaseExample(themeName = "Genitiv", part1 = "Die Mutter ", part2 = " Freundin kocht gut.", correctArticle = "der", translation = "La mère de l\'amie cuisine bien."),
            CaseExample(themeName = "Genitiv", part1 = "Der Geruch ", part2 = " Brotes ist wunderbar.", correctArticle = "des", translation = "L\'odeur du pain est merveilleuse."),
            CaseExample(themeName = "Genitiv", part1 = "Während ", part2 = " Sommers reisen wir.", correctArticle = "des", translation = "Pendant l\'été, nous voyageons."),
            CaseExample(themeName = "Genitiv", part1 = "Die Größe ", part2 = " Gartens beeindruckt mich.", correctArticle = "des", translation = "La taille du jardin m\'impressionne.")
        )
    )
    themes.forEach { (_, examples) ->
        db.caseDao().insertExamples(examples)
    }
}
