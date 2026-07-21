package com.germanapp.ui.qcm

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.germanapp.R
import com.germanapp.databinding.FragmentQcmBinding

class QcmFragment : Fragment() {
    private var _binding: FragmentQcmBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: QcmViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentQcmBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[QcmViewModel::class.java]

        viewModel.pools.observe(viewLifecycleOwner) { pools ->
            val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, pools)
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            binding.poolSpinner.adapter = adapter
            binding.poolSpinner.setOnItemClickListener { _, _, position, _ ->
                viewModel.selectPool(pools[position])
            }
        }

        viewModel.questions.observe(viewLifecycleOwner) { updateQuestion() }
        viewModel.currentQuestionIndex.observe(viewLifecycleOwner) { updateQuestion() }
        viewModel.score.observe(viewLifecycleOwner) {
            binding.scoreText.text = "Score: ${it}/${viewModel.totalAnswered.value}"
        }
    }

    private fun updateQuestion() {
        val q = viewModel.currentQuestion() ?: return
        binding.questionText.text = q.question
        binding.answerGrid.removeAllViews()
        q.answers.forEach { answer ->
            val btn = Button(requireContext())
            btn.text = answer
            btn.setBackgroundResource(R.drawable.btn_answer)
            btn.setOnClickListener {
                viewModel.answer(answer)
                updateQuestion()
            }
            binding.answerGrid.addView(btn)
        }
        if (viewModel.isComplete()) {
            binding.questionText.text = "Fertig! Score: ${viewModel.score.value}/${viewModel.totalAnswered.value}"
            binding.answerGrid.removeAllViews()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
