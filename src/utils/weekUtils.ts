
import React, { useState, useEffect } from 'react';


export function getCurrentWeekRange(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday=0, Monday=1, ..., Saturday=6

  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Move to Monday
  const sundayOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;  // Move to Sunday

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  

  const sunday = new Date(today);
  sunday.setDate(today.getDate() + sundayOffset);

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${formatDate(monday)} - ${formatDate(sunday)}, ${today.getFullYear()}`;
}
