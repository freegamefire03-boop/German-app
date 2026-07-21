package com.germanapp.ui.flashcards

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.germanapp.databinding.FragmentFlashcardsBinding

class FlashcardsFragment : Fragment() {
    private var _binding: FragmentFlashcardsBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: FlashcardsViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentFlashcardsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[FlashcardsViewModel::class.java]

        binding.themeList.layoutManager = LinearLayoutManager(requireContext())
        val adapter = ThemeAdapter { theme ->
            viewModel.selectTheme(theme.id)
            showFlashcardView()
        }
        binding.themeList.adapter = adapter

        viewModel.themes.observe(viewLifecycleOwner) { themes ->
            adapter.submitList(themes)
        }
    }

    private fun showFlashcardView() {
        val inflater = LayoutInflater.from(requireContext())
        val flashcardView = inflater.inflate(
            com.germanapp.R.layout.fragment_flashcards,
            binding.root as ViewGroup,
            false
        )
        // For simplicity, navigate back to hub when done
        findNavController().navigateUp()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
