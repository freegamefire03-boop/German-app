package com.germanapp.ui.cases

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.germanapp.R
import com.germanapp.databinding.FragmentCasesBinding

class CasesFragment : Fragment() {
    private var _binding: FragmentCasesBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: CasesViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentCasesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[CasesViewModel::class.java]

        viewModel.themes.observe(viewLifecycleOwner) { themes ->
            val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, themes)
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            binding.caseSpinner.adapter = adapter
            binding.caseSpinner.setOnItemClickListener { _, _, position, _ ->
                viewModel.selectTheme(themes[position])
            }
        }

        viewModel.currentIndex.observe(viewLifecycleOwner) { updateExample() }
        viewModel.score.observe(viewLifecycleOwner) {
            binding.caseScoreText.text = "Score: ${it}/${viewModel.totalAnswered.value}"
        }
    }

    private fun updateExample() {
        val ex = viewModel.currentExample() ?: return
        binding.sentenceText.text = ex.part1 + "___" + ex.part2
        binding.translationText.text = ex.translation
        binding.articleGrid.removeAllViews()

        viewModel.defaultArticles.forEach { article ->
            val btn = Button(requireContext())
            btn.text = article
            btn.setBackgroundResource(R.drawable.btn_answer)
            btn.setOnClickListener {
                viewModel.answer(article)
                updateExample()
            }
            binding.articleGrid.addView(btn)
        }

        if (viewModel.isComplete()) {
            binding.sentenceText.text = "Fertig! Score: ${viewModel.score.value}/${viewModel.totalAnswered.value}"
            binding.translationText.text = ""
            binding.articleGrid.removeAllViews()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
