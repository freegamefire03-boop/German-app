package com.germanapp.ui.flashcards

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.germanapp.databinding.ItemThemeCardBinding

class ThemeAdapter(private val onClick: (com.germanapp.data.model.Theme) -> Unit) :
    ListAdapter<ThemeWithProgress, ThemeAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemThemeCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemThemeCardBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: ThemeWithProgress) {
            binding.themeName.text = item.theme.name
            binding.wordCount.text = "${item.totalCount} Wörter"
            binding.progressText.text = "${item.masteredCount}/${item.totalCount} gelernt"
            binding.root.setOnClickListener { onClick(item.theme) }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<ThemeWithProgress>() {
        override fun areItemsTheSame(old: ThemeWithProgress, new: ThemeWithProgress) = old.theme.id == new.theme.id
        override fun areContentsTheSame(old: ThemeWithProgress, new: ThemeWithProgress) = old == new
    }
}
