package com.germanapp.ui.verbs

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.germanapp.databinding.FragmentVerbsBinding

class VerbsFragment : Fragment() {
    private var _binding: FragmentVerbsBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: VerbsViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentVerbsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[VerbsViewModel::class.java]

        viewModel.currentIndex.observe(viewLifecycleOwner) { updateVerbDisplay() }
        viewModel.verbs.observe(viewLifecycleOwner) { if (it.isNotEmpty()) updateVerbDisplay() }

        binding.btnPrevVerb.setOnClickListener { viewModel.previous() }
        binding.btnNextVerb.setOnClickListener { viewModel.next() }
        binding.btnToggleMastered.setOnClickListener { viewModel.toggleMastered() }
    }

    private fun updateVerbDisplay() {
        val verb = viewModel.currentVerb ?: return
        binding.verbInfinitive.text = verb.infinitive
        binding.verbTranslation.text = verb.translation
        binding.conjugationText.text = buildString {
            append("ich ${verb.praesensIch}\n")
            append("du ${verb.praesensDu}\n")
            append("er/sie/es ${verb.praesensEr}\n")
            append("wir ${verb.praesensWir}\n")
            append("ihr ${verb.praesensIhr}\n")
            append("sie/Sie ${verb.praesensSie}\n")
            if (verb.praeteritum.isNotEmpty()) append("\nPräteritum: ${verb.praeteritum}\n")
            if (verb.partizip2.isNotEmpty()) append("Partizip II: ${verb.partizip2}")
        }
        binding.btnToggleMastered.text = if (verb.mastered) "✓ Maîtrisé" else "Marquer maîtrisé"
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
