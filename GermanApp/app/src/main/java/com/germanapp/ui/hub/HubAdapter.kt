package com.germanapp.ui.hub

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.germanapp.databinding.ItemAppCardBinding

class HubAdapter(private val onClick: (AppInfo) -> Unit) :
    ListAdapter<AppInfo, HubAdapter.ViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemAppCardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(private val binding: ItemAppCardBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(app: AppInfo) {
            binding.appName.text = app.name
            binding.appDescription.text = app.description
            binding.appIcon.text = app.icon
            binding.root.setOnClickListener { onClick(app) }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<AppInfo>() {
        override fun areItemsTheSame(old: AppInfo, new: AppInfo) = old.id == new.id
        override fun areContentsTheSame(old: AppInfo, new: AppInfo) = old == new
    }
}
