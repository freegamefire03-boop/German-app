package com.germanapp.ui.hub

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.germanapp.R
import com.germanapp.databinding.FragmentHubBinding

class HubFragment : Fragment() {
    private var _binding: FragmentHubBinding? = null
    private val binding get() = _binding!!
    private lateinit var viewModel: HubViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentHubBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this)[HubViewModel::class.java]

        binding.appGrid.layoutManager = LinearLayoutManager(requireContext())
        val adapter = HubAdapter { app ->
            val navId = when (app.id) {
                "flashcards" -> R.id.action_hub_to_flashcards
                "verbs" -> R.id.action_hub_to_verbs
                "qcm" -> R.id.action_hub_to_qcm
                "cases" -> R.id.action_hub_to_cases
                else -> return@HubAdapter
            }
            view.findNavController().navigate(navId)
        }
        binding.appGrid.adapter = adapter
        adapter.submitList(viewModel.apps)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
