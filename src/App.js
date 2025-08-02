
import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    addDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    setDoc, // Import setDoc for global favorites
    getDoc // Import getDoc for global favorites check
} from 'firebase/firestore';

/* global __initial_auth_token, __app_id */

// Define context for Firebase and Auth
const FirebaseContext = createContext(null);

// Define a static master player list
const MASTER_PLAYER_LIST = [
    { id: 'p1', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', rank: 1, image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=JC', status: 'available' },
    { id: 'p2', name: 'Bijan Robinson', position: 'RB', team: 'ATL', rank: 2, image: 'https://placehold.co/100x100/00FF00/000000?text=BR', status: 'available' },
    { id: 'p3', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', rank: 3, image: 'https://placehold.co/100x100/0000FF/FFFFFF?text=CL', status: 'available' },
    { id: 'p4', name: 'Justin Jefferson', position: 'WR', team: 'MIN', rank: 4, image: 'https://placehold.co/100x100/FFFF00/000000?text=JJ', status: 'available' },
    { id: 'p5', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', rank: 5, image: 'https://placehold.co/100x100/FF00FF/FFFFFF?text=JG', status: 'available' },
    { id: 'p6', name: 'Puka Nacua', position: 'WR', team: 'LAR', rank: 6, image: 'https://placehold.co/100x100/00FFFF/000000?text=PN', status: 'available' },
    { id: 'p7', name: 'Malik Nabers', position: 'WR', team: 'NYG', rank: 7, image: 'https://placehold.co/100x100/800000/FFFFFF?text=MN', status: 'available' },
    { id: 'p8', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', rank: 8, image: 'https://placehold.co/100x100/008000/FFFFFF?text=AS', status: 'available' },
    { id: 'p9', name: 'Saquon Barkley', position: 'RB', team: 'PHI', rank: 9, image: 'https://placehold.co/100x100/000080/FFFFFF?text=SB', status: 'available' },
    { id: 'p10', name: 'Nico Collins', position: 'WR', team: 'HOU', rank: 10, image: 'https://placehold.co/100x100/808000/FFFFFF?text=NC', status: 'available' },
    { id: 'p11', name: 'Brian Thomas Jr.', position: 'WR', team: 'JAC', rank: 11, image: 'https://placehold.co/100x100/FFD700/000000?text=BT', status: 'available' },
    { id: 'p12', name: 'Drake London', position: 'WR', team: 'ATL', rank: 12, image: 'https://placehold.co/100x100/F0F8FF/000000?text=DL', status: 'available' },
    { id: 'p13', name: 'Ashton Jeanty', position: 'RB', team: 'LV', rank: 13, image: 'https://placehold.co/100x100/FAEBD7/000000?text=AJ', status: 'available' },
    { id: 'p14', name: 'De\'Von Achane', position: 'RB', team: 'MIA', rank: 14, image: 'https://placehold.co/100x100/7FFFD4/000000?text=DA', status: 'available' },
    { id: 'p15', name: 'Brock Bowers', position: 'TE', team: 'LV', rank: 15, image: 'https://placehold.co/100x100/FFE4C4/000000?text=BB', status: 'available' },
    { id: 'p16', name: 'Christian McCaffrey', position: 'RB', team: 'SF', rank: 16, image: 'https://placehold.co/100x100/DEB887/000000?text=CM', status: 'available' },
    { id: 'p17', name: 'A.J. Brown', position: 'WR', team: 'PHI', rank: 17, image: 'https://placehold.co/100x100/5F9EA0/FFFFFF?text=AB', status: 'available' },
    { id: 'p18', name: 'Ladd McConkey', position: 'WR', team: 'LAC', rank: 18, image: 'https://placehold.co/100x100/7FFF00/000000?text=LM', status: 'available' },
    { id: 'p19', name: 'Trey McBride', position: 'TE', team: 'ARI', rank: 19, image: 'https://placehold.co/100x100/D2691E/FFFFFF?text=TM', status: 'available' },
    { id: 'p20', name: 'Jaxon Smith-Njigba', position: 'WR', team: 'SEA', rank: 20, image: 'https://placehold.co/100x100/FF7F50/FFFFFF?text=JS', status: 'available' },
    { id: 'p21', name: 'Derrick Henry', position: 'RB', team: 'BAL', rank: 21, image: 'https://placehold.co/100x100/6495ED/FFFFFF?text=DH', status: 'available' },
    { id: 'p22', name: 'Garrett Wilson', position: 'WR', team: 'NYJ', rank: 22, image: 'https://placehold.co/100x100/FFF8DC/000000?text=GW', status: 'available' },
    { id: 'p23', name: 'Tee Higgins', position: 'WR', team: 'CIN', rank: 23, image: 'https://placehold.co/100x100/DC143C/FFFFFF?text=TH', status: 'available' },
    { id: 'p24', name: 'Josh Allen', position: 'QB', team: 'BUF', rank: 24, image: 'https://placehold.co/100x100/00FFFF/000000?text=JA', status: 'available' },
    { id: 'p25', name: 'Lamar Jackson', position: 'QB', team: 'BAL', rank: 25, image: 'https://placehold.co/100x100/00008B/FFFFFF?text=LJ', status: 'available' },
    { id: 'p26', name: 'Rashee Rice', position: 'WR', team: 'KC', rank: 26, image: 'https://placehold.co/100x100/008B8B/FFFFFF?text=RR', status: 'available' },
    { id: 'p27', name: 'Bucky Irving', position: 'RB', team: 'TB', rank: 27, image: 'https://placehold.co/100x100/B8860B/FFFFFF?text=BI', status: 'available' },
    { id: 'p28', name: 'Tyreek Hill', position: 'WR', team: 'MIA', rank: 28, image: 'https://placehold.co/100x100/A9A9A9/FFFFFF?text=TH', status: 'available' },
    { id: 'p29', name: 'Josh Jacobs', position: 'RB', team: 'GB', rank: 29, image: 'https://placehold.co/100x100/006400/FFFFFF?text=JJ', status: 'available' },
    { id: 'p30', name: 'Chase Brown', position: 'RB', team: 'CIN', rank: 30, image: 'https://placehold.co/100x100/BDB76B/FFFFFF?text=CB', status: 'available' },
    { id: 'p31', name: 'Jayden Daniels', position: 'QB', team: 'WAS', rank: 31, image: 'https://placehold.co/100x100/8B008B/FFFFFF?text=JD', status: 'available' },
    { id: 'p32', name: 'Davante Adams', position: 'WR', team: 'LAR', rank: 32, image: 'https://placehold.co/100x100/556B2F/FFFFFF?text=DA', status: 'available' },
    { id: 'p33', name: 'George Kittle', position: 'TE', team: 'SF', rank: 33, image: 'https://placehold.co/100x100/FF8C00/FFFFFF?text=GK', status: 'available' },
    { id: 'p34', name: 'Jonathan Taylor', position: 'RB', team: 'IND', rank: 34, image: 'https://placehold.co/100x100/9932CC/FFFFFF?text=JT', status: 'available' },
    { id: 'p35', name: 'Mike Evans', position: 'WR', team: 'TB', rank: 35, image: 'https://placehold.co/100x100/8B0000/FFFFFF?text=ME', status: 'available' },
    { id: 'p36', name: 'Terry McLaurin', position: 'WR', team: 'WAS', rank: 36, image: 'https://placehold.co/100x100/E9967A/FFFFFF?text=TM', status: 'available' },
    { id: 'p37', name: 'Jalen Hurts', position: 'QB', team: 'PHI', rank: 37, image: 'https://placehold.co/100x100/8FBC8F/FFFFFF?text=JH', status: 'available' },
    { id: 'p38', name: 'Kyren Williams', position: 'RB', team: 'LAR', rank: 38, image: 'https://placehold.co/100x100/483D8B/FFFFFF?text=KW', status: 'available' },
    { id: 'p39', name: 'Breece Hall', position: 'RB', team: 'NYJ', rank: 39, image: 'https://placehold.co/100x100/2F4F4F/FFFFFF?text=BH', status: 'available' },
    { id: 'p40', name: 'DJ Moore', position: 'WR', team: 'CHI', rank: 40, image: 'https://placehold.co/100x100/00CED1/FFFFFF?text=DM', status: 'available' },
    { id: 'p41', name: 'Alvin Kamara', position: 'RB', team: 'NO', rank: 41, image: 'https://placehold.co/100x100/9400D3/FFFFFF?text=AK', status: 'available' },
    { id: 'p42', name: 'Marvin Harrison Jr.', position: 'WR', team: 'ARI', rank: 42, image: 'https://placehold.co/100x100/FF1493/FFFFFF?text=MH', status: 'available' },
    { id: 'p43', name: 'Kenneth Walker III', position: 'RB', team: 'SEA', rank: 43, image: 'https://placehold.co/100x100/00BFFF/FFFFFF?text=KW', status: 'available' },
    { id: 'p44', name: 'James Cook', position: 'RB', team: 'BUF', rank: 44, image: 'https://placehold.co/100x100/696969/FFFFFF?text=JC', status: 'available' },
    { id: 'p45', name: 'Courtland Sutton', position: 'WR', team: 'DEN', rank: 45, image: 'https://placehold.co/100x100/1E90FF/FFFFFF?text=CS', status: 'available' },
    { id: 'p46', name: 'Joe Burrow', position: 'QB', team: 'CIN', rank: 46, image: 'https://placehold.co/100x100/B22222/FFFFFF?text=JB', status: 'available' },
    { id: 'p47', name: 'DeVonta Smith', position: 'WR', team: 'PHI', rank: 47, image: 'https://placehold.co/100x100/228B22/FFFFFF?text=DS', status: 'available' },
    { id: 'p48', name: 'DK Metcalf', position: 'WR', team: 'PIT', rank: 48, image: 'https://placehold.co/100x100/FF00FF/FFFFFF?text=DM', status: 'available' },
    { id: 'p49', name: 'Chuba Hubbard', position: 'RB', team: 'CAR', rank: 49, image: 'https://placehold.co/100x100/DCDCDC/000000?text=CH', status: 'available' },
    { id: 'p50', name: 'Zay Flowers', position: 'WR', team: 'BAL', rank: 50, image: 'https://placehold.co/100x100/F8F8FF/000000?text=ZF', status: 'available' },
    { id: 'p51', name: 'James Conner', position: 'RB', team: 'ARI', rank: 51, image: 'https://placehold.co/100x100/FFD700/000000?text=JC', status: 'available' },
    { id: 'p52', name: 'Chris Olave', position: 'WR', team: 'NO', rank: 52, image: 'https://placehold.co/100x100/DAA520/FFFFFF?text=CO', status: 'available' },
    { id: 'p53', name: 'Joe Mixon', position: 'RB', team: 'HOU', rank: 53, image: 'https://placehold.co/100x100/808080/FFFFFF?text=JM', status: 'available' },
    { id: 'p54', name: 'Jaylen Waddle', position: 'WR', team: 'MIA', rank: 54, image: 'https://placehold.co/100x100/008000/FFFFFF?text=JW', status: 'available' },
    { id: 'p55', name: 'Omarion Hampton', position: 'RB', team: 'LAC', rank: 55, image: 'https://placehold.co/100x100/ADFF2F/000000?text=OH', status: 'available' },
    { id: 'p56', name: 'Chris Godwin', position: 'WR', team: 'TB', rank: 56, image: 'https://placehold.co/100x100/F0FFF0/000000?text=CG', status: 'available' },
    { id: 'p57', name: 'Tetairoa McMillan', position: 'WR', team: 'CAR', rank: 57, image: 'https://placehold.co/100x100/FF69B4/FFFFFF?text=TM', status: 'available' },
    { id: 'p58', name: 'Sam LaPorta', position: 'TE', team: 'DET', rank: 58, image: 'https://placehold.co/100x100/CD5C5C/FFFFFF?text=SL', status: 'available' },
    { id: 'p59', name: 'Patrick Mahomes II', position: 'QB', team: 'KC', rank: 59, image: 'https://placehold.co/100x100/4B0082/FFFFFF?text=PM', status: 'available' },
    { id: 'p60', name: 'Travis Hunter', position: 'WR', team: 'JAC', rank: 60, image: 'https://placehold.co/100x100/FFFFF0/000000?text=TH', status: 'available' },
    { id: 'p61', name: 'Jameson Williams', position: 'WR', team: 'DET', rank: 61, image: 'https://placehold.co/100x100/F0E68C/000000?text=JW', status: 'available' },
    { id: 'p62', name: 'David Montgomery', position: 'RB', team: 'DET', rank: 62, image: 'https://placehold.co/100x100/E6E6FA/000000?text=DM', status: 'available' },
    { id: 'p63', name: 'Baker Mayfield', position: 'QB', team: 'TB', rank: 63, image: 'https://placehold.co/100x100/FFF0F5/000000?text=BM', status: 'available' },
    { id: 'p64', name: 'D\'Andre Swift', position: 'RB', team: 'CHI', rank: 64, image: 'https://placehold.co/100x100/7CFC00/000000?text=DS', status: 'available' },
    { id: 'p65', name: 'Xavier Worthy', position: 'WR', team: 'KC', rank: 65, image: 'https://placehold.co/100x100/FFFACD/000000?text=XW', status: 'available' },
    { id: 'p66', name: 'T.J. Hockenson', position: 'TE', team: 'MIN', rank: 66, image: 'https://placehold.co/100x100/ADD8E6/000000?text=TH', status: 'available' },
    { id: 'p67', name: 'Jerry Jeudy', position: 'WR', team: 'CLE', rank: 67, image: 'https://placehold.co/100x100/F08080/FFFFFF?text=JJ', status: 'available' },
    { id: 'p68', name: 'RJ Harvey', position: 'RB', team: 'DEN', rank: 68, image: 'https://placehold.co/100x100/E0FFFF/000000?text=RH', status: 'available' },
    { id: 'p69', name: 'Aaron Jones Sr.', position: 'RB', team: 'MIN', rank: 69, image: 'https://placehold.co/100x100/FAFAD2/000000?text=AJ', status: 'available' },
    { id: 'p70', name: 'George Pickens', position: 'WR', team: 'DAL', rank: 70, image: 'https://placehold.co/100x100/D3D3D3/000000?text=GP', status: 'available' },
    { id: 'p71', name: 'TreVeyon Henderson', position: 'RB', team: 'NE', rank: 71, image: 'https://placehold.co/100x100/90EE90/000000?text=TH', status: 'available' },
    { id: 'p72', name: 'Calvin Ridley', position: 'WR', team: 'TEN', rank: 72, image: 'https://placehold.co/100x100/FFB6C1/000000?text=CR', status: 'available' },
    { id: 'p73', name: 'Bo Nix', position: 'QB', team: 'DEN', rank: 73, image: 'https://placehold.co/100x100/FFA07A/FFFFFF?text=BN', status: 'available' },
    { id: 'p74', name: 'Isiah Pacheco', position: 'RB', team: 'KC', rank: 74, image: 'https://placehold.co/100x100/20B2AA/FFFFFF?text=IP', status: 'available' },
    { id: 'p75', name: 'Tony Pollard', position: 'RB', team: 'TEN', rank: 75, image: 'https://placehold.co/100x100/87CEFA/FFFFFF?text=TP', status: 'available' },
    { id: 'p76', name: 'Kyler Murray', position: 'QB', team: 'ARI', rank: 76, image: 'https://placehold.co/100x100/778899/FFFFFF?text=KM', status: 'available' },
    { id: 'p77', name: 'Travis Kelce', position: 'TE', team: 'KC', rank: 77, image: 'https://placehold.co/100x100/B0C4DE/000000?text=TK', status: 'available' },
    { id: 'p78', name: 'Jordan Addison', position: 'WR', team: 'MIN', rank: 78, image: 'https://placehold.co/100x100/FFFFE0/000000?text=JA', status: 'available' },
    { id: 'p79', name: 'Rome Odunze', position: 'WR', team: 'CHI', rank: 79, image: 'https://placehold.co/100x100/00FF00/000000?text=RO', status: 'available' },
    { id: 'p80', name: 'Evan Engram', position: 'TE', team: 'DEN', rank: 80, image: 'https://placehold.co/100x100/32CD32/FFFFFF?text=EE', status: 'available' },
    { id: 'p81', name: 'Kaleb Johnson', position: 'RB', team: 'PIT', rank: 81, image: 'https://placehold.co/100x100/FAF0E6/000000?text=KJ', status: 'available' },
    { id: 'p82', name: 'Khalil Shakir', position: 'WR', team: 'BUF', rank: 82, image: 'https://placehold.co/100x100/FF00FF/FFFFFF?text=KS', status: 'available' },
    { id: 'p83', name: 'Jauan Jennings', position: 'WR', team: 'SF', rank: 83, image: 'https://placehold.co/100x100/800000/FFFFFF?text=JJ', status: 'available' },
    { id: 'p84', name: 'Jakobi Meyers', position: 'WR', team: 'LV', rank: 84, image: 'https://placehold.co/100x100/66CDAA/FFFFFF?text=JM', status: 'available' },
    { id: 'p85', name: 'David Njoku', position: 'TE', team: 'CLE', rank: 85, image: 'https://placehold.co/100x100/0000CD/FFFFFF?text=DN', status: 'available' },
    { id: 'p86', name: 'Jaylen Warren', position: 'RB', team: 'PIT', rank: 86, image: 'https://placehold.co/100x100/BA55D3/FFFFFF?text=JW', status: 'available' },
    { id: 'p87', name: 'Justin Fields', position: 'QB', team: 'NYJ', rank: 87, image: 'https://placehold.co/100x100/9370DB/FFFFFF?text=JF', status: 'available' },
    { id: 'p88', name: 'Brian Robinson Jr.', position: 'RB', team: 'WAS', rank: 88, image: 'https://placehold.co/100x100/3CB371/FFFFFF?text=BR', status: 'available' },
    { id: 'p89', name: 'Mark Andrews', position: 'TE', team: 'BAL', rank: 89, image: 'https://placehold.co/100x100/7B68EE/FFFFFF?text=MA', status: 'available' },
    { id: 'p90', name: 'Stefon Diggs', position: 'WR', team: 'NE', rank: 90, image: 'https://placehold.co/100x100/00FA9A/000000?text=SD', status: 'available' },
    { id: 'p91', name: 'Travis Etienne Jr.', position: 'RB', team: 'JAC', rank: 91, image: 'https://placehold.co/100x100/48D1CC/FFFFFF?text=TE', status: 'available' },
    { id: 'p92', name: 'Brock Purdy', position: 'QB', team: 'SF', rank: 92, image: 'https://placehold.co/100x100/C71585/FFFFFF?text=BP', status: 'available' },
    { id: 'p93', name: 'Caleb Williams', position: 'QB', team: 'CHI', rank: 93, image: 'https://placehold.co/100x100/191970/FFFFFF?text=CW', status: 'available' },
    { id: 'p94', name: 'Josh Downs', position: 'WR', team: 'IND', rank: 94, image: 'https://placehold.co/100x100/F5FFFA/000000?text=JD', status: 'available' },
    { id: 'p95', name: 'Quinshon Judkins', position: 'RB', team: 'CLE', rank: 95, image: 'https://placehold.co/100x100/FFE4E1/000000?text=QJ', status: 'available' },
    { id: 'p96', name: 'Justin Herbert', position: 'QB', team: 'LAC', rank: 96, image: 'https://placehold.co/100x100/FFE4B5/000000?text=JH', status: 'available' },
    { id: 'p97', name: 'Dak Prescott', position: 'QB', team: 'DAL', rank: 97, image: 'https://placehold.co/100x100/FFDEAD/000000?text=DP', status: 'available' },
    { id: 'p98', name: 'Jared Goff', position: 'QB', team: 'DET', rank: 98, image: 'https://placehold.co/100x100/000080/FFFFFF?text=JG', status: 'available' },
    { id: 'p99', name: 'Tyrone Tracy Jr.', position: 'RB', team: 'NYG', rank: 99, image: 'https://placehold.co/100x100/FDF5E6/000000?text=TT', status: 'available' },
    { id: 'p100', name: 'Michael Pittman Jr.', position: 'WR', team: 'IND', rank: 100, image: 'https://placehold.co/100x100/808000/FFFFFF?text=MP', status: 'available' },
    { id: 'p101', name: 'Deebo Samuel Sr.', position: 'WR', team: 'WAS', rank: 101, image: 'https://placehold.co/100x100/6B8E23/FFFFFF?text=DS', status: 'available' },
    { id: 'p102', name: 'Tucker Kraft', position: 'TE', team: 'GB', rank: 102, image: 'https://placehold.co/100x100/FFA500/FFFFFF?text=TK', status: 'available' },
    { id: 'p103', name: 'Najee Harris', position: 'RB', team: 'LAC', rank: 103, image: 'https://placehold.co/100x100/FF4500/FFFFFF?text=NH', status: 'available' },
    { id: 'p104', name: 'Cooper Kupp', position: 'WR', team: 'SEA', rank: 104, image: 'https://placehold.co/100x100/DA70D6/FFFFFF?text=CK', status: 'available' },
    { id: 'p105', name: 'Jayden Reed', position: 'WR', team: 'GB', rank: 105, image: 'https://placehold.co/100x100/EEE8AA/000000?text=JR', status: 'available' },
    { id: 'p106', name: 'Javonte Williams', position: 'RB', team: 'DAL', rank: 106, image: 'https://placehold.co/100x100/98FB98/000000?text=JW', status: 'available' },
    { id: 'p107', name: 'Ricky Pearsall', position: 'WR', team: 'SF', rank: 107, image: 'https://placehold.co/100x100/AFEEEE/000000?text=RP', status: 'available' },
    { id: 'p108', name: 'Drake Maye', position: 'QB', team: 'NE', rank: 108, image: 'https://placehold.co/100x100/DB7093/FFFFFF?text=DM', status: 'available' },
    { id: 'p109', name: 'Jordan Love', position: 'QB', team: 'GB', rank: 109, image: 'https://placehold.co/100x100/FFEFD5/000000?text=JL', status: 'available' },
    { id: 'p110', name: 'Jake Ferguson', position: 'TE', team: 'DAL', rank: 110, image: 'https://placehold.co/100x100/FFDAB9/000000?text=JF', status: 'available' },
    { id: 'p111', name: 'Brandon Aiyuk', position: 'WR', team: 'SF', rank: 111, image: 'https://placehold.co/100x100/CD853F/FFFFFF?text=BA', status: 'available' },
    { id: 'p112', name: 'Trevor Lawrence', position: 'QB', team: 'JAC', rank: 112, image: 'https://placehold.co/100x100/FFC0CB/000000?text=TL', status: 'available' },
    { id: 'p113', name: 'Zach Charbonnet', position: 'RB', team: 'SEA', rank: 113, image: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=ZC', status: 'available' },
    { id: 'p114', name: 'C.J. Stroud', position: 'QB', team: 'HOU', rank: 114, image: 'https://placehold.co/100x100/B0E0E6/000000?text=CS', status: 'available' },
    { id: 'p115', name: 'Dalton Kincaid', position: 'TE', team: 'BUF', rank: 115, image: 'https://placehold.co/100x100/800080/FFFFFF?text=DK', status: 'available' },
    { id: 'p116', name: 'Darnell Mooney', position: 'WR', team: 'ATL', rank: 116, image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=DM', status: 'available' },
    { id: 'p117', name: 'Rhamondre Stevenson', position: 'RB', team: 'NE', rank: 117, image: 'https://placehold.co/100x100/BC8F8F/FFFFFF?text=RS', status: 'available' },
    { id: 'p118', name: 'Tyjae Spears', position: 'RB', team: 'TEN', rank: 118, image: 'https://placehold.co/100x100/4169E1/FFFFFF?text=TS', status: 'available' },
    { id: 'p119', name: 'Tyler Warren', position: 'TE', team: 'IND', rank: 119, image: 'https://placehold.co/100x100/8B4513/FFFFFF?text=TW', status: 'available' },
    { id: 'p120', name: 'Jordan Mason', position: 'RB', team: 'MIN', rank: 120, image: 'https://placehold.co/100x100/FA8072/FFFFFF?text=JM', status: 'available' },
    { id: 'p121', name: 'J.J. McCarthy', position: 'QB', team: 'MIN', rank: 121, image: 'https://placehold.co/100x100/F4A460/FFFFFF?text=JM', status: 'available' },
    { id: 'p122', name: 'Cam Skattebo', position: 'RB', team: 'NYG', rank: 122, image: 'https://placehold.co/100x100/2E8B57/FFFFFF?text=CS', status: 'available' },
    { id: 'p123', name: 'Rachaad White', position: 'RB', team: 'TB', rank: 123, image: 'https://placehold.co/100x100/FFF5EE/000000?text=RW', status: 'available' },
    { id: 'p124', name: 'Dallas Goedert', position: 'TE', team: 'PHI', rank: 124, image: 'https://placehold.co/100x100/A0522D/FFFFFF?text=DG', status: 'available' },
    { id: 'p125', name: 'Christian Kirk', position: 'WR', team: 'HOU', rank: 125, image: 'https://placehold.co/100x100/C0C0C0/000000?text=CK', status: 'available' },
    { id: 'p126', name: 'Matthew Stafford', position: 'QB', team: 'LAR', rank: 126, image: 'https://placehold.co/100x100/87CEEB/FFFFFF?text=MS', status: 'available' },
    { id: 'p127', name: 'Tua Tagovailoa', position: 'QB', team: 'MIA', rank: 127, image: 'https://placehold.co/100x100/6A5ACD/FFFFFF?text=TT', status: 'available' },
    { id: 'p128', name: 'Jonnu Smith', position: 'TE', team: 'PIT', rank: 128, image: 'https://placehold.co/100x100/708090/FFFFFF?text=JS', status: 'available' },
    { id: 'p129', name: 'Rashid Shaheed', position: 'WR', team: 'NO', rank: 129, image: 'https://placehold.co/100x100/00FF7F/000000?text=RS', status: 'available' },
    { id: 'p130', name: 'Emeka Egbuka', position: 'WR', team: 'TB', rank: 130, image: 'https://placehold.co/100x100/4682B4/FFFFFF?text=EE', status: 'available' },
    { id: 'p131', name: 'Austin Ekeler', position: 'RB', team: 'WAS', rank: 131, image: 'https://placehold.co/100x100/D2B48C/000000?text=AE', status: 'available' },
    { id: 'p132', name: 'Keon Coleman', position: 'WR', team: 'BUF', rank: 132, image: 'https://placehold.co/100x100/D8BFD8/000000?text=KC', status: 'available' },
    { id: 'p133', name: 'Matthew Golden', position: 'WR', team: 'GB', rank: 133, image: 'https://placehold.co/100x100/FF6347/FFFFFF?text=MG', status: 'available' },
    { id: 'p134', name: 'Luther Burden III', position: 'WR', team: 'CHI', rank: 134, image: 'https://placehold.co/100x100/40E0D0/FFFFFF?text=LB', status: 'available' },
    { id: 'p135', name: 'Bryce Young', position: 'QB', team: 'CAR', rank: 135, image: 'https://placehold.co/100x100/EE82EE/FFFFFF?text=BY', status: 'available' },
    { id: 'p136', name: 'Tank Bigsby', position: 'RB', team: 'JAC', rank: 136, image: 'https://placehold.co/100x100/F5DEB3/000000?text=TB', status: 'available' },
    { id: 'p137', name: 'Hunter Henry', position: 'TE', team: 'NE', rank: 137, image: 'https://placehold.co/100x100/FFFFFF/000000?text=HH', status: 'available' },
    { id: 'p138', name: 'Cedric Tillman', position: 'WR', team: 'CLE', rank: 138, image: 'https://placehold.co/100x100/F5F5DC/000000?text=CT', status: 'available' },
    { id: 'p139', name: 'Colston Loveland', position: 'TE', team: 'CHI', rank: 139, image: 'https://placehold.co/100x100/FFF8DC/000000?text=CL', status: 'available' },
    { id: 'p140', name: 'Ray Davis', position: 'RB', team: 'BUF', rank: 140, image: 'https://placehold.co/100x100/FFFACD/000000?text=RD', status: 'available' },
    { id: 'p141', name: 'J.K. Dobbins', position: 'RB', team: 'DEN', rank: 141, image: 'https://placehold.co/100x100/FAFAD2/000000?text=JD', status: 'available' },
    { id: 'p142', name: 'Michael Penix Jr.', position: 'QB', team: 'ATL', rank: 142, image: 'https://placehold.co/100x100/FFFFE0/000000?text=MP', status: 'available' },
    { id: 'p143', name: 'Rashod Bateman', position: 'WR', team: 'BAL', rank: 143, image: 'https://placehold.co/100x100/8B4513/FFFFFF?text=RB', status: 'available' },
    { id: 'p144', name: 'Rico Dowdle', position: 'RB', team: 'CAR', rank: 144, image: 'https://placehold.co/100x100/FFA07A/FFFFFF?text=RD', status: 'available' },
    { id: 'p145', name: 'Trey Benson', position: 'RB', team: 'ARI', rank: 145, image: 'https://placehold.co/100x100/FA8072/FFFFFF?text=TB', status: 'available' },
    { id: 'p146', name: 'Marquise Brown', position: 'WR', team: 'KC', rank: 146, image: 'https://placehold.co/100x100/E9967A/FFFFFF?text=MB', status: 'available' },
    { id: 'p147', name: 'Tyler Allgeier', position: 'RB', team: 'ATL', rank: 147, image: 'https://placehold.co/100x100/F08080/FFFFFF?text=TA', status: 'available' },
    { id: 'p148', name: 'Isaac Guerendo', position: 'RB', team: 'SF', rank: 148, image: 'https://placehold.co/100x100/CD5C5C/FFFFFF?text=IG', status: 'available' },
    { id: 'p149', name: 'Geno Smith', position: 'QB', team: 'LV', rank: 149, image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=GS', status: 'available' },
    { id: 'p150', name: 'Marvin Mims Jr.', position: 'WR', team: 'DEN', rank: 150, image: 'https://placehold.co/100x100/B22222/FFFFFF?text=MM', status: 'available' },
    { id: 'p151', name: 'Adam Thielen', position: 'WR', team: 'CAR', rank: 151, image: 'https://placehold.co/100x100/A52A2A/FFFFFF?text=AT', status: 'available' },
    { id: 'p152', name: 'Romeo Doubs', position: 'WR', team: 'GB', rank: 152, image: 'https://placehold.co/100x100/8B0000/FFFFFF?text=RD', status: 'available' },
    { id: 'p153', name: 'Zach Ertz', position: 'TE', team: 'WAS', rank: 153, image: 'https://placehold.co/100x100/FFFFFF/000000?text=ZE', status: 'available' },
    { id: 'p154', name: 'Jaydon Blue', position: 'RB', team: 'DAL', rank: 154, image: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=JB', status: 'available' },
    { id: 'p155', name: 'Wan\'Dale Robinson', position: 'WR', team: 'NYG', rank: 155, image: 'https://placehold.co/100x100/9932CC/FFFFFF?text=WR', status: 'available' },
    { id: 'p156', name: 'Braelon Allen', position: 'RB', team: 'NYJ', rank: 156, image: 'https://placehold.co/100x100/9400D3/FFFFFF?text=BA', status: 'available' },
    { id: 'p157', name: 'Jaylen Wright', position: 'RB', team: 'MIA', rank: 157, image: 'https://placehold.co/100x100/8B008B/FFFFFF?text=JW', status: 'available' },
    { id: 'p158', name: 'Bhayshul Tuten', position: 'RB', team: 'JAC', rank: 158, image: 'https://placehold.co/100x100/800080/FFFFFF?text=BT', status: 'available' },
    { id: 'p159', name: 'Tre Harris', position: 'WR', team: 'LAC', rank: 159, image: 'https://placehold.co/100x100/4B0082/FFFFFF?text=TH', status: 'available' },
    { id: 'p160', name: 'Denver Broncos', position: 'DST', team: 'DEN', rank: 160, image: 'https://placehold.co/100x100/6A5ACD/FFFFFF?text=DB', status: 'available' },
    { id: 'p161', name: 'Jalen McMillan', position: 'WR', team: 'TB', rank: 161, image: 'https://placehold.co/100x100/483D8B/FFFFFF?text=JM', status: 'available' },
    { id: 'p162', name: 'Kyle Williams', position: 'WR', team: 'NE', rank: 162, image: 'https://placehold.co/100x100/191970/FFFFFF?text=KW', status: 'available' },
    { id: 'p163', name: 'Jerome Ford', position: 'RB', team: 'CLE', rank: 163, image: 'https://placehold.co/100x100/000080/FFFFFF?text=JF', status: 'available' },
    { id: 'p164', name: 'Kyle Pitts', position: 'TE', team: 'ATL', rank: 164, image: 'https://placehold.co/100x100/00008B/FFFFFF?text=KP', status: 'available' },
    { id: 'p165', name: 'Roschon Johnson', position: 'RB', team: 'CHI', rank: 165, image: 'https://placehold.co/100x100/0000CD/FFFFFF?text=RJ', status: 'available' },
    { id: 'p166', name: 'Sam Darnold', position: 'QB', team: 'SEA', rank: 166, image: 'https://placehold.co/100x100/4169E1/FFFFFF?text=SD', status: 'available' },
    { id: 'p167', name: 'Philadelphia Eagles', position: 'DST', team: 'PHI', rank: 167, image: 'https://placehold.co/100x100/1E90FF/FFFFFF?text=PE', status: 'available' },
    { id: 'p168', name: 'Quentin Johnston', position: 'WR', team: 'LAC', rank: 168, image: 'https://placehold.co/100x100/00BFFF/FFFFFF?text=QJ', status: 'available' },
    { id: 'p169', name: 'Xavier Legette', position: 'WR', team: 'CAR', rank: 169, image: 'https://placehold.co/100x100/87CEFA/FFFFFF?text=XL', status: 'available' },
    { id: 'p170', name: 'Jayden Higgins', position: 'WR', team: 'HOU', rank: 170, image: 'https://placehold.co/100x100/87CEEB/FFFFFF?text=JH', status: 'available' },
    { id: 'p171', name: 'DeMario Douglas', position: 'WR', team: 'NE', rank: 171, image: 'https://placehold.co/100x100/6495ED/FFFFFF?text=DD', status: 'available' },
    { id: 'p172', name: 'Pat Freiermuth', position: 'TE', team: 'PIT', rank: 172, image: 'https://placehold.co/100x100/B0C4DE/000000?text=PF', status: 'available' },
    { id: 'p173', name: 'Baltimore Ravens', position: 'DST', team: 'BAL', rank: 173, image: 'https://placehold.co/100x100/ADD8E6/000000?text=BR', status: 'available' },
    { id: 'p174', name: 'Cameron Ward', position: 'QB', team: 'TEN', rank: 174, image: 'https://placehold.co/100x100/B0E0E6/000000?text=CW', status: 'available' },
    { id: 'p175', name: 'Pittsburgh Steelers', position: 'DST', team: 'PIT', rank: 175, image: 'https://placehold.co/100x100/FFFAF0/000000?text=PS', status: 'available' },
    { id: 'p176', name: 'Joshua Palmer', position: 'WR', team: 'BUF', rank: 176, image: 'https://placehold.co/100x100/F0FFF0/000000?text=JP', status: 'available' },
    { id: 'p177', name: 'Mike Gesicki', position: 'TE', team: 'CIN', rank: 177, image: 'https://placehold.co/100x100/F5FFFA/000000?text=MG', status: 'available' },
    { id: 'p178', name: 'Minnesota Vikings', position: 'DST', team: 'MIN', rank: 178, image: 'https://placehold.co/100x100/7FFFD4/000000?text=MV', status: 'available' },
    { id: 'p179', name: 'MarShawn Lloyd', position: 'RB', team: 'GB', rank: 179, image: 'https://placehold.co/100x100/F0FFFF/000000?text=ML', status: 'available' },
    { id: 'p180', name: 'Isaiah Likely', position: 'TE', team: 'BAL', rank: 180, image: 'https://placehold.co/100x100/AFEEEE/000000?text=IL', status: 'available' },
    { id: 'p181', name: 'Blake Corum', position: 'RB', team: 'LAR', rank: 181, image: 'https://placehold.co/100x100/E0FFFF/000000?text=BC', status: 'available' },
    { id: 'p182', name: 'DeAndre Hopkins', position: 'WR', team: 'BAL', rank: 182, image: 'https://placehold.co/100x100/FFFFF0/000000?text=DH', status: 'available' },
    { id: 'p183', name: 'Houston Texans', position: 'DST', team: 'HOU', rank: 183, image: 'https://placehold.co/100x100/F0FFF0/000000?text=HT', status: 'available' },
    { id: 'p184', name: 'Kansas City Chiefs', position: 'DST', team: 'KC', rank: 184, image: 'https://placehold.co/100x100/F5F5F5/000000?text=KC', status: 'available' },
    { id: 'p185', name: 'Buffalo Bills', position: 'DST', team: 'BUF', rank: 185, image: 'https://placehold.co/100x100/F5F5DC/000000?text=BB', status: 'available' },
    { id: 'p186', name: 'Brandon Aubrey', position: 'K', team: 'DAL', rank: 186, image: 'https://placehold.co/100x100/FDF5E6/000000?text=BA', status: 'available' },
    { id: 'p187', name: 'Brenton Strange', position: 'TE', team: 'JAC', rank: 187, image: 'https://placehold.co/100x100/FFFAF0/000000?text=BS', status: 'available' },
    { id: 'p188', name: 'Jack Bech', position: 'WR', team: 'LV', rank: 188, image: 'https://placehold.co/100x100/FAF0E6/000000?text=JB', status: 'available' },
    { id: 'p189', name: 'Jalen Coker', position: 'WR', team: 'CAR', rank: 189, image: 'https://placehold.co/100x100/FFF5EE/000000?text=JC', status: 'available' },
    { id: 'p190', name: 'Nick Chubb', position: 'RB', team: 'HOU', rank: 190, image: 'https://placehold.co/100x100/F5F5F5/000000?text=NC', status: 'available' },
    { id: 'p191', name: 'Jake Bates', position: 'K', team: 'DET', rank: 191, image: 'https://placehold.co/100x100/FFF8DC/000000?text=JB', status: 'available' },
    { id: 'p192', name: 'Aaron Rodgers', position: 'QB', team: 'PIT', rank: 192, image: 'https://placehold.co/100x100/FAEBD7/000000?text=AR', status: 'available' },
    { id: 'p193', name: 'Detroit Lions', position: 'DST', team: 'DET', rank: 193, image: 'https://placehold.co/100x100/FFEFD5/000000?text=DL', status: 'available' },
    { id: 'p194', name: 'Cameron Dicker', position: 'K', team: 'LAC', rank: 194, image: 'https://placehold.co/100x100/FFEBCD/000000?text=CD', status: 'available' },
    { id: 'p195', name: 'Michael Wilson', position: 'WR', team: 'ARI', rank: 195, image: 'https://placehold.co/100x100/FFE4C4/000000?text=MW', status: 'available' },
    { id: 'p196', name: 'Los Angeles Chargers', position: 'DST', team: 'LAC', rank: 196, image: 'https://placehold.co/100x100/FFDAB9/000000?text=LA', status: 'available' },
    { id: 'p197', name: 'Cade Otton', position: 'TE', team: 'TB', rank: 197, image: 'https://placehold.co/100x100/FFDEAD/000000?text=CO', status: 'available' },
    { id: 'p198', name: 'Alec Pierce', position: 'WR', team: 'IND', rank: 198, image: 'https://placehold.co/100x100/FFE4B5/000000?text=AP', status: 'available' },
    { id: 'p199', name: 'Dylan Sampson', position: 'RB', team: 'CLE', rank: 199, image: 'https://placehold.co/100x100/DEB887/000000?text=DS', status: 'available' },
    { id: 'p200', name: 'Justice Hill', position: 'RB', team: 'BAL', rank: 200, image: 'https://placehold.co/100x100/D2B48C/000000?text=JH', status: 'available' },
    { id: 'p201', name: 'Wil Lutz', position: 'K', team: 'DEN', rank: 201, image: 'https://placehold.co/100x100/BC8F8F/FFFFFF?text=WL', status: 'available' },
    { id: 'p202', name: 'Los Angeles Rams', position: 'DST', team: 'LAR', rank: 202, image: 'https://placehold.co/100x100/F4A460/FFFFFF?text=LA', status: 'available' },
    { id: 'p203', name: 'Kareem Hunt', position: 'RB', team: 'KC', rank: 203, image: 'https://placehold.co/100x100/CD853F/FFFFFF?text=KH', status: 'available' },
    { id: 'p204', name: 'Chig Okonkwo', position: 'TE', team: 'TEN', rank: 204, image: 'https://placehold.co/100x100/A0522D/FFFFFF?text=CO', status: 'available' },
    { id: 'p205', name: 'Chris Boswell', position: 'K', team: 'PIT', rank: 205, image: 'https://placehold.co/100x100/D2691E/FFFFFF?text=CB', status: 'available' },
    { id: 'p206', name: 'Chase McLaughlin', position: 'K', team: 'TB', rank: 206, image: 'https://placehold.co/100x100/8B4513/FFFFFF?text=CM', status: 'available' },
    { id: 'p207', name: 'Green Bay Packers', position: 'DST', team: 'GB', rank: 207, image: 'https://placehold.co/100x100/A52A2A/FFFFFF?text=GB', status: 'available' },
    { id: 'p208', name: 'Seattle Seahawks', position: 'DST', team: 'SEA', rank: 208, image: 'https://placehold.co/100x100/B22222/FFFFFF?text=SS', status: 'available' },
    { id: 'p209', name: 'Ka\'imi Fairbairn', position: 'K', team: 'HOU', rank: 209, image: 'https://placehold.co/100x100/8B0000/FFFFFF?text=KF', status: 'available' },
    { id: 'p210', name: 'Dontayvion Wicks', position: 'WR', team: 'GB', rank: 210, image: 'https://placehold.co/100x100/800000/FFFFFF?text=DW', status: 'available' },
    { id: 'p211', name: 'Adonai Mitchell', position: 'WR', team: 'IND', rank: 211, image: 'https://placehold.co/100x100/FFFFFF/000000?text=AM', status: 'available' },
    { id: 'p212', name: 'Evan McPherson', position: 'K', team: 'CIN', rank: 212, image: 'https://placehold.co/100x100/4B0082/FFFFFF?text=EM', status: 'available' },
    { id: 'p213', name: 'Mason Taylor', position: 'TE', team: 'NYJ', rank: 213, image: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=MT', status: 'available' },
    { id: 'p214', name: 'Harrison Butker', position: 'K', team: 'KC', rank: 214, image: 'https://placehold.co/100x100/9400D3/FFFFFF?text=HB', status: 'available' },
    { id: 'p215', name: 'New York Jets', position: 'DST', team: 'NYJ', rank: 215, image: 'https://placehold.co/100x100/9932CC/FFFFFF?text=NY', status: 'available' },
    { id: 'p216', name: 'Tyler Bass', position: 'K', team: 'BUF', rank: 216, image: 'https://placehold.co/100x100/BA55D3/FFFFFF?text=TB', status: 'available' },
    { id: 'p217', name: 'Jaylin Noel', position: 'WR', team: 'HOU', rank: 217, image: 'https://placehold.co/100x100/8B008B/FFFFFF?text=JN', status: 'available' },
    { id: 'p218', name: 'Dalton Schultz', position: 'TE', team: 'HOU', rank: 218, image: 'https://placehold.co/100x100/800080/FFFFFF?text=DS', status: 'available' },
    { id: 'p219', name: 'Darius Slayton', position: 'WR', team: 'NYG', rank: 219, image: 'https://placehold.co/100x100/663399/FFFFFF?text=DS', status: 'available' },
    { id: 'p220', name: 'Andrei Iosivas', position: 'WR', team: 'CIN', rank: 220, image: 'https://placehold.co/100x100/483D8B/FFFFFF?text=AI', status: 'available' },
    { id: 'p221', name: 'Jake Elliott', position: 'K', team: 'PHI', rank: 221, image: 'https://placehold.co/100x100/191970/FFFFFF?text=JE', status: 'available' },
    { id: 'p222', name: 'DJ Giddens', position: 'RB', team: 'IND', rank: 222, image: 'https://placehold.co/100x100/000080/FFFFFF?text=DG', status: 'available' },
    { id: 'p223', name: 'Devaughn Vele', position: 'WR', team: 'DEN', rank: 223, image: 'https://placehold.co/100x100/00008B/FFFFFF?text=DV', status: 'available' },
    { id: 'p224', name: 'Jaleel McLaughlin', position: 'RB', team: 'DEN', rank: 224, image: 'https://placehold.co/100x100/0000CD/FFFFFF?text=JM', status: 'available' },
    { id: 'p225', name: 'Kendre Miller', position: 'RB', team: 'NO', rank: 225, image: 'https://placehold.co/100x100/4169E1/FFFFFF?text=KM', status: 'available' },
    { id: 'p226', name: 'Calvin Austin III', position: 'WR', team: 'PIT', rank: 226, image: 'https://placehold.co/100x100/1E90FF/FFFFFF?text=CA', status: 'available' },
    { id: 'p227', name: 'Elic Ayomanor', position: 'WR', team: 'TEN', rank: 227, image: 'https://placehold.co/100x100/00BFFF/FFFFFF?text=EA', status: 'available' },
    { id: 'p228', name: 'Tyler Lockett', position: 'WR', team: 'TEN', rank: 228, image: 'https://placehold.co/100x100/ADD8E6/000000?text=TL', status: 'available' },
    { id: 'p229', name: 'Anthony Richardson Sr.', position: 'QB', team: 'IND', rank: 229, image: 'https://placehold.co/100x100/B0E0E6/000000?text=AR', status: 'available' },
    { id: 'p230', name: 'San Francisco 49ers', position: 'DST', team: 'SF', rank: 230, image: 'https://placehold.co/100x100/87CEFA/FFFFFF?text=SF', status: 'available' },
    { id: 'p231', name: 'Jason Sanders', position: 'K', team: 'MIA', rank: 231, image: 'https://placehold.co/100x100/87CEEB/FFFFFF?text=JS', status: 'available' },
    { id: 'p232', name: 'Younghoe Koo', position: 'K', team: 'ATL', rank: 232, image: 'https://placehold.co/100x100/6495ED/FFFFFF?text=YK', status: 'available' },
    { id: 'p233', name: 'Devin Neal', position: 'RB', team: 'NO', rank: 233, image: 'https://placehold.co/100x100/B0C4DE/000000?text=DN', status: 'available' },
    { id: 'p234', name: 'Russell Wilson', position: 'QB', team: 'NYG', rank: 234, image: 'https://placehold.co/100x100/778899/FFFFFF?text=RW', status: 'available' },
    { id: 'p235', name: 'Keenan Allen', position: 'WR', team: 'FA', rank: 235, image: 'https://placehold.co/100x100/708090/FFFFFF?text=KA', status: 'available' },
    { id: 'p236', name: 'Ja\'Tavion Sanders', position: 'TE', team: 'CAR', rank: 236, image: 'https://placehold.co/100x100/696969/FFFFFF?text=JS', status: 'available' },
    { id: 'p237', name: 'Brandin Cooks', position: 'WR', team: 'NO', rank: 237, image: 'https://placehold.co/100x100/F0F8FF/000000?text=BC', status: 'available' },
    { id: 'p238', name: 'Miles Sanders', position: 'RB', team: 'DAL', rank: 238, image: 'https://placehold.co/100x100/F5F5F5/000000?text=MS', status: 'available' },
    { id: 'p239', name: 'Jalen Tolbert', position: 'WR', team: 'DAL', rank: 239, image: 'https://placehold.co/100x100/DCDCDC/000000?text=JT', status: 'available' },
    { id: 'p240', name: 'Cole Kmet', position: 'TE', team: 'CHI', rank: 240, image: 'https://placehold.co/100x100/D3D3D3/000000?text=CK', status: 'available' },
    { id: 'p241', name: 'Pat Bryant', position: 'WR', team: 'DEN', rank: 241, image: 'https://placehold.co/100x100/A9A9A9/FFFFFF?text=PB', status: 'available' },
    { id: 'p242', name: 'Juwan Johnson', position: 'TE', team: 'NO', rank: 242, image: 'https://placehold.co/100x100/C0C0C0/000000?text=JJ', status: 'available' },
    { id: 'p243', name: 'Kyle Monangai', position: 'RB', team: 'CHI', rank: 243, image: 'https://placehold.co/100x100/E6E6FA/000000?text=KM', status: 'available' },
    { id: 'p244', name: 'Dallas Cowboys', position: 'DST', team: 'DAL', rank: 244, image: 'https://placehold.co/100x100/D8BFD8/000000?text=DC', status: 'available' },
    { id: 'p245', name: 'Audric Estime', position: 'RB', team: 'DEN', rank: 245, image: 'https://placehold.co/100x100/FF6347/FFFFFF?text=AE', status: 'available' },
    { id: 'p246', name: 'Raheem Mostert', position: 'RB', team: 'LV', rank: 246, image: 'https://placehold.co/100x100/FF4500/FFFFFF?text=RM', status: 'available' },
    { id: 'p247', name: 'Elijah Moore', position: 'WR', team: 'BUF', rank: 247, image: 'https://placehold.co/100x100/FF0000/FFFFFF?text=EM', status: 'available' },
    { id: 'p248', name: 'Elijah Mitchell', position: 'RB', team: 'KC', rank: 248, image: 'https://placehold.co/100x100/DC143C/FFFFFF?text=EM', status: 'available' },
    { id: 'p249', name: 'Will Shipley', position: 'RB', team: 'PHI', rank: 249, image: 'https://placehold.co/100x100/B22222/FFFFFF?text=WS', status: 'available' },
    { id: 'p250', name: 'Nick Westbrook-Ikhine', position: 'WR', team: 'MIA', rank: 250, image: 'https://placehold.co/100x100/A52A2A/FFFFFF?text=NW', status: 'available' },
    // --- Defenses ---
    { id: 'p251', name: 'Tampa Bay Buccaneers', position: 'DST', team: 'TB', rank: 251, image: 'https://placehold.co/100x100/708090/FFFFFF?text=TB', status: 'available' },
    { id: 'p252', name: 'Chicago Bears', position: 'DST', team: 'CHI', rank: 252, image: 'https://placehold.co/100x100/778899/FFFFFF?text=CB', status: 'available' },
    { id: 'p253', name: 'New England Patriots', position: 'DST', team: 'NE', rank: 253, image: 'https://placehold.co/100x100/696969/FFFFFF?text=NE', status: 'available' },
    { id: 'p254', name: 'Arizona Cardinals', position: 'DST', team: 'ARI', rank: 254, image: 'https://placehold.co/100x100/2F4F4F/FFFFFF?text=AC', status: 'available' },
    { id: 'p255', name: 'Cleveland Browns', position: 'DST', team: 'CLE', rank: 255, image: 'https://placehold.co/100x100/008B8B/FFFFFF?text=CB', status: 'available' },
    { id: 'p256', name: 'New York Giants', position: 'DST', team: 'NYG', rank: 256, image: 'https://placehold.co/100x100/483D8B/FFFFFF?text=NY', status: 'available' },
    { id: 'p257', name: 'Miami Dolphins', position: 'DST', team: 'MIA', rank: 257, image: 'https://placehold.co/100x100/2F4F4F/FFFFFF?text=MD', status: 'available' },
    { id: 'p258', name: 'Washington Commanders', position: 'DST', team: 'WAS', rank: 258, image: 'https://placehold.co/100x100/00CED1/FFFFFF?text=WC', status: 'available' },
    { id: 'p259', name: 'Atlanta Falcons', position: 'DST', team: 'ATL', rank: 259, image: 'https://placehold.co/100x100/1E90FF/FFFFFF?text=AF', status: 'available' },
    { id: 'p260', name: 'Cincinnati Bengals', position: 'DST', team: 'CIN', rank: 260, image: 'https://placehold.co/100x100/B0C4DE/FFFFFF?text=CB', status: 'available' },
    { id: 'p261', name: 'Indianapolis Colts', position: 'DST', team: 'IND', rank: 261, image: 'https://placehold.co/100x100/ADD8E6/000000?text=IC', status: 'available' },
    { id: 'p262', name: 'New Orleans Saints', position: 'DST', team: 'NO', rank: 262, image: 'https://placehold.co/100x100/B0E0E6/000000?text=NO', status: 'available' },
    { id: 'p263', name: 'Las Vegas Raiders', position: 'DST', team: 'LV', rank: 263, image: 'https://placehold.co/100x100/87CEFA/FFFFFF?text=LV', status: 'available' },
    { id: 'p264', name: 'Jacksonville Jaguars', position: 'DST', team: 'JAC', rank: 264, image: 'https://placehold.co/100x100/87CEEB/FFFFFF?text=JJ', status: 'available' },
    { id: 'p265', name: 'Tennessee Titans', position: 'DST', team: 'TEN', rank: 265, image: 'https://placehold.co/100x100/6495ED/FFFFFF?text=TT', status: 'available' },
    { id: 'p266', name: 'Carolina Panthers', position: 'DST', team: 'CAR', rank: 266, image: 'https://placehold.co/100x100/B0C4DE/000000?text=CP', status: 'available' },
    // --- Kickers ---
    { id: 'p267', name: 'Tyler Loop', position: 'K', team: 'BAL', rank: 267, image: 'https://placehold.co/100x100/F0F8FF/000000?text=TL', status: 'available' },
    { id: 'p268', name: 'Cam Little', position: 'K', team: 'JAC', rank: 268, image: 'https://placehold.co/100x100/FAEBD7/000000?text=CL', status: 'available' },
    { id: 'p269', name: 'Cairo Santos', position: 'K', team: 'CHI', rank: 269, image: 'https://placehold.co/100x100/FFE4C4/000000?text=CS', status: 'available' },
    { id: 'p270', name: 'Jake Moody', position: 'K', team: 'SF', rank: 270, image: 'https://placehold.co/100x100/DEB887/000000?text=JM', status: 'available' },
    { id: 'p271', name: 'Brandon McManus', position: 'K', team: 'GB', rank: 271, image: 'https://placehold.co/100x100/5F9EA0/FFFFFF?text=BM', status: 'available' },
    { id: 'p272', name: 'Blake Grupe', position: 'K', team: 'NO', rank: 272, image: 'https://placehold.co/100x100/7FFF00/000000?text=BG', status: 'available' },
    { id: 'p273', name: 'Graham Gano', position: 'K', team: 'NYG', rank: 273, image: 'https://placehold.co/100x100/D2691E/FFFFFF?text=GG', status: 'available' },
    { id: 'p274', name: 'Chad Ryland', position: 'K', team: 'ARI', rank: 274, image: 'https://placehold.co/100x100/FF7F50/FFFFFF?text=CR', status: 'available' },
    { id: 'p275', name: 'Andy Borregales', position: 'K', team: 'NE', rank: 275, image: 'https://placehold.co/100x100/6495ED/FFFFFF?text=AB', status: 'available' },
    { id: 'p276', name: 'Justin Tucker', position: 'K', team: 'FA', rank: 276, image: 'https://placehold.co/100x100/DC143C/FFFFFF?text=JT', status: 'available' },
];


// Firebase Provider Component
const FirebaseProvider = ({ children }) => {
    const [app, setApp] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [globalFavorites, setGlobalFavorites] = useState([]); // New state for global favorites
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    useEffect(() => {
        try {
            // YOUR FIREBASE CONFIG OBJECT IS NOW DIRECTLY INCLUDED HERE.
            // DO NOT CHANGE THIS SECTION UNLESS YOUR FIREBASE PROJECT CONFIG CHANGES.
            const firebaseConfig = {
                apiKey: "AIzaSyDOR5iJMqiKEkItcm4KAa_9Ny-y1ElTHcU",
                authDomain: "hood-auction-draft---draft.firebaseapp.com",
                projectId: "hood-auction-draft---draft",
                storageBucket: "hood-auction-draft---draft.firebaseapp.com",
                messagingSenderId: "889293648217",
                appId: "1:889293648217:web:894986b2221c0b66ad9c48",
            };

            const initializedApp = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(initializedApp);
            const firebaseAuth = getAuth(initializedApp);

            setApp(initializedApp);
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Listen for auth state changes
            const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setCurrentUserEmail(user.email);
                } else {
                    setUserId(null);
                    setCurrentUserEmail(null);
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
        }
    }, []);

    // Effect to fetch global favorites once authenticated
    useEffect(() => {
        if (!db || !userId) {
            setGlobalFavorites([]); // Clear favorites if not authenticated
            return;
        }

        const favoritesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/globalFavorites`);
        const unsubscribe = onSnapshot(favoritesCollectionRef, (snapshot) => {
            const fetchedFavorites = [];
            snapshot.forEach((doc) => {
                fetchedFavorites.push(doc.id); // Store just the player ID
            });
            setGlobalFavorites(fetchedFavorites);
        }, (error) => {
            console.error("Error fetching global favorites:", error);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    // Function to toggle global favorite status
    const toggleGlobalFavorite = useCallback(async (playerId) => {
        if (!db || !userId) return;
        const favoriteDocRef = doc(db, `artifacts/${appId}/users/${userId}/globalFavorites`, playerId);

        try {
            const docSnap = await getDoc(favoriteDocRef);
            if (docSnap.exists()) {
                // Player is favorited, unfavorite them
                await deleteDoc(favoriteDocRef);
            } else {
                // Player is not favorited, favorite them
                await setDoc(favoriteDocRef, { favoritedAt: new Date() }); // Add a timestamp
            }
        } catch (e) {
            console.error("Error toggling global favorite:", e);
        }
    }, [db, userId, appId]);

    // Helper to check if a player is globally favorited
    const isGlobalFavorite = useCallback((playerId) => {
        return globalFavorites.includes(playerId);
    }, [globalFavorites]);

    return (
        <FirebaseContext.Provider value={{ app, db, auth, userId, currentUserEmail, isAuthReady, globalFavorites, toggleGlobalFavorite, isGlobalFavorite, MASTER_PLAYER_LIST }}>
            {children}
        </FirebaseContext.Provider>
    );
};

// Custom hook to use Firebase context
const useFirebase = () => useContext(FirebaseContext);

// --- Components ---

const AuthScreen = () => {
    const { auth, isAuthReady, userId } = useFirebase();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);

    const handleAuthAction = async (actionType) => {
        setError('');
        if (!auth) {
            setError("Firebase Auth not initialized.");
            return;
        }

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            if (actionType === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            if (err.code === 'auth/invalid-email') {
                setError("Invalid email address format.");
            } else if (err.code === 'auth/user-disabled') {
                setError("This user account has been disabled.");
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Invalid email or password.");
            } else if (err.code === 'auth/email-already-in-use') {
                setError("This email is already registered. Try logging in.");
            } else if (err.code === 'auth/weak-password') {
                setError("Password is too weak. Must be at least 6 characters.");
            } else {
                setError(`Authentication failed: ${err.message}`);
            }
        }
    };

    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Authentication...</h2>
                    <p className="text-gray-600">Please wait while we prepare your session.</p>
                </div>
            </div>
        );
    }

    if (userId) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {isLoginMode ? 'Login' : 'Sign Up'}
                </h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(isLoginMode ? 'login' : 'signup'); }}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                            Email:
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password:
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isLoginMode ? "current-password" : "new-password"}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md transform hover:scale-105"
                        >
                            {isLoginMode ? 'Login' : 'Sign Up'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLoginMode(!isLoginMode)}
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Header = ({ onNavigate, currentView, currentUserEmail, onLogout, showFavoritesButton }) => {
    return (
        <header className="bg-gray-800 text-white p-4 shadow-lg rounded-b-lg">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">Football Auction</h1>
                <nav className="flex items-center space-x-4">
                    <ul className="flex space-x-4">
                        <li>
                            <button
                                onClick={() => onNavigate('home')}
                                className={`px-4 py-2 rounded-md transition-colors duration-200 ${currentView === 'home' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => onNavigate('leagues')}
                                className={`px-4 py-2 rounded-md transition-colors duration-200 ${currentView === 'leagues' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                            >
                                Leagues
                            </button>
                        </li>
                        {showFavoritesButton && (
                            <li>
                                <button
                                    onClick={() => onNavigate('favorites')}
                                    className={`px-4 py-2 rounded-md transition-colors duration-200 ${currentView === 'favorites' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                                >
                                    Favorites
                                </button>
                            </li>
                        )}
                    </ul>
                    {currentUserEmail && (
                        <div className="flex items-center space-x-2 ml-4">
                            <span className="text-sm text-gray-300">Logged in as: {currentUserEmail}</span>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 shadow-sm"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

const LeagueList = ({ onSelectLeague, userId, onEditRosterSettings, onEditTeamProfile, onDeleteLeague }) => {
    const { db, isAuthReady } = useFirebase();
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPastRosterModal, setShowPastRosterModal] = useState(false);
    const [pastRosterData, setPastRosterData] = useState(null);

    useEffect(() => {
        if (!db || !isAuthReady || !userId) {
            console.log("LeagueList: DB not ready or user not authenticated.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        const publicLeaguesRef = collection(db, `artifacts/${appId}/public/data/leagues`);
        const q = query(publicLeaguesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLeagues = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.members && data.members.includes(userId)) {
                    fetchedLeagues.push({ id: doc.id, ...data });
                }
            });
            setLeagues(fetchedLeagues);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching leagues:", err);
            setError("Failed to load leagues. Please try again.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, isAuthReady]);

    const handleViewPastRoster = (league) => {
        if (league.lastCompletedDraft) {
            setPastRosterData(league.lastCompletedDraft);
            setShowPastRosterModal(true);
        }
    };

    if (loading) return <div className="text-center p-4">Loading leagues...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Active Leagues</h2>
            {leagues.length === 0 ? (
                <p className="text-gray-600">You haven't joined any leagues yet. Create or join one!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 text-left text-gray-700">League Name</th>
                                <th className="py-2 px-4 text-left text-gray-700">Admin</th>
                                <th className="py-2 px-4 text-left text-gray-700">Teams Joined</th>
                                <th className="py-2 px-4 text-left text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leagues.map((league) => {
                                const userTeam = league.teams.find(team => team.id === userId);
                                return (
                                    <tr key={league.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-800">
                                            {league.name}
                                            {userTeam && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Your Team: {userTeam.name}
                                                    <button
                                                        onClick={() => onEditTeamProfile(league, userTeam)}
                                                        className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                                                    >
                                                        (Edit Profile)
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 text-gray-800">{league.adminId === userId ? "You (Admin)" : league.adminId.substring(0,4) + '...'}</td>
                                        <td className="py-2 px-4 flex space-x-2">
                                            <button
                                                onClick={() => onSelectLeague(league)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 shadow-sm"
                                            >
                                                View Details
                                            </button>
                                            {league.adminId === userId && (
                                                <>
                                                    <button
                                                        onClick={() => onEditRosterSettings(league)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 shadow-sm"
                                                    >
                                                        Edit Roster
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteLeague(league.id, league.name)}
                                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 shadow-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                            {league.lastCompletedDraft && (
                                                <button
                                                    onClick={() => handleViewPastRoster(league)}
                                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors duration-200 shadow-sm"
                                                >
                                                    View Last Draft Roster ({league.lastCompletedDraft.year})
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showPastRosterModal && pastRosterData && (
                <PastRosterModal
                    pastRosterData={pastRosterData}
                    onClose={() => setShowPastRosterModal(false)}
                />
            )}
        </div>
    );
};


const LeaguesScreen = ({ onSelectLeague, userId }) => {
    const { db, isAuthReady } = useFirebase();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showEditRosterModal, setShowEditRosterModal] = useState(false);
    const [selectedLeagueForEdit, setSelectedLeagueForEdit] = useState(null);
    const [showEditTeamProfileModal, setShowEditTeamProfileModal] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState(null);
    const [message, setMessage] = useState('');
    const [messageModalContent, setMessageModalContent] = useState(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // Default roster settings for new leagues
    const DEFAULT_ROSTER_SETTINGS = {
        QB: 1,
        RB: 2,
        WR: 3,
        TE: 1,
        DEF: 1,
        K: 1,
        FLEX: 1,
        SUPERFLEX: 1,
        BENCH: 6,
		bidDuration: 20,       // ADD THIS
		intermission: 30,    // ADD THIS
		rebidDuration: 15,     // ADD THIS
    };

    const handleCreateLeague = async (leagueName, joinPassword) => {
        if (!db || !isAuthReady || !userId) {
            setMessage("Firebase not ready or user not authenticated.");
            return;
        }
        try {
            const leaguesCollectionRef = collection(db, `artifacts/${appId}/public/data/leagues`);
            await addDoc(leaguesCollectionRef, {
                name: leagueName,
                adminId: userId,
                createdAt: new Date(),
                members: [userId],
                status: 'pending',
                currentPlayerIndex: null,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: null,
                isPaused: false,
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                players: MASTER_PLAYER_LIST.map(p => ({...p, status: 'available'})), // Use MASTER_PLAYER_LIST for new leagues
                teams: [{ id: userId, name: `Team ${userId.substring(0, 4)}`, budget: 200, roster: [], profilePicture: null, isOnline: false, lastSeen: null }],
                rosterSettings: DEFAULT_ROSTER_SETTINGS,
                joinPassword: joinPassword || null,
                lastCompletedDraft: null,
                tiedBids: null,
                rebidInfo: null,
                readyMembers: [], // Initialize readyMembers array
            });
            setMessage(`League "${leagueName}" created successfully!`);
            setShowCreateModal(false);
        } catch (e) {
            console.error("Error creating league: ", e);
            setMessage("Error creating league. Please try again.");
        }
    };

    const handleJoinLeague = async (leagueName, joinPassword) => {
        if (!db || !isAuthReady || !userId) {
            setMessage("Firebase not ready or user not authenticated.");
            return;
        }
        try {
            const leaguesCollectionRef = collection(db, `artifacts/${appId}/public/data/leagues`);
            const q = query(leaguesCollectionRef, where("name", "==", leagueName));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setMessage(`League "${leagueName}" not found.`);
                return;
            }

            const leagueDoc = querySnapshot.docs[0];
            const leagueData = leagueDoc.data();
            const leagueId = leagueDoc.id;

            // Check join password if required
            if (leagueData.joinPassword && leagueData.joinPassword !== joinPassword) {
                setMessage("Incorrect league password.");
                return;
            }

            if (leagueData.members && leagueData.members.includes(userId)) {
                setMessage(`You are already a member of "${leagueName}".`);
                return;
            }

            const updatedMembers = [...(leagueData.members || []), userId];
            const updatedTeams = [...(leagueData.teams || []), { id: userId, name: `Team ${userId.substring(0, 4)}`, budget: 200, roster: [], profilePicture: null, isOnline: false, lastSeen: null }];

            await updateDoc(doc(db, `artifacts/${appId}/public/data/leagues`, leagueId), {
                members: updatedMembers,
                teams: updatedTeams
            });
            setMessage(`Successfully joined league "${leagueName}"!`);
            setShowJoinModal(false);
        } catch (e) {
            console.error("Error joining league: ", e);
            setMessage("Error joining league. Please try again.");
        }
    };

    const handleEditRosterSettings = (league) => {
        setSelectedLeagueForEdit(league);
        setShowEditRosterModal(true);
    };

    const handleSaveRosterSettings = async (leagueId, newRosterSettings) => {
        if (!db || !isAuthReady || !userId) {
            setMessage("Firebase not ready or user not authenticated.");
            return;
        }
        try {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, leagueId);
            await updateDoc(leagueDocRef, {
                rosterSettings: newRosterSettings
            });
            setMessage("Roster settings updated successfully!");
            setShowEditRosterModal(false);
            setSelectedLeagueForEdit(null);
        } catch (e) {
            console.error("Error updating roster settings:", e);
            setMessage("Error updating roster settings. Please try again.");
        }
    };

    const handleEditTeamProfile = (league, team) => {
        setTeamToEdit({ leagueId: league.id, teamId: team.id, currentName: team.name, currentProfilePicture: team.profilePicture });
        setShowEditTeamProfileModal(true);
    };

    const handleSaveTeamProfile = async (leagueId, teamId, newName, newProfilePicture) => {
        if (!db || !isAuthReady || !userId) {
            setMessage("Firebase not ready or user not authenticated.");
            return;
        }
        if (!newName.trim()) {
            setMessage("Team name cannot be empty.");
            return;
        }
        try {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, leagueId);
            const leagueData = (await getDocs(query(collection(db, `artifacts/${appId}/public/data/leagues`), where("__name__", "==", leagueId)))).docs[0].data();
            const updatedTeams = leagueData.teams.map(team =>
                team.id === teamId ? { ...team, name: newName.trim(), profilePicture: newProfilePicture } : team
            );
            await updateDoc(leagueDocRef, { teams: updatedTeams });
            setMessage("Team profile updated successfully!");
            setShowEditTeamProfileModal(false);
            setTeamToEdit(null);
        } catch (e) {
            console.error("Error updating team profile:", e);
            setMessage("Error updating team profile. Please try again.");
        }
    };

    const handleDeleteLeague = async (leagueId, leagueName) => {
        if (!db || !isAuthReady || !userId) {
            setMessage("Firebase not ready or user not authenticated.");
            return;
        }

        setMessageModalContent({
            title: "Confirm Deletion",
            message: `Are you sure you want to delete the league "${leagueName}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, leagueId);
                    await deleteDoc(leagueDocRef);
                    setMessage(`League "${leagueName}" deleted successfully.`);
                    if (onSelectLeague && selectedLeagueForEdit && selectedLeagueForEdit.id === leagueId) {
                        onSelectLeague(null);
                    }
                } catch (e) {
                    console.error("Error deleting league:", e);
                    setMessage("Error deleting league. Please try again.");
                } finally {
                    setMessageModalContent(null);
                }
            },
            onCancel: () => setMessageModalContent(null)
        });
    };


    return (
        <div className="container mx-auto p-4 font-inter">
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    Create League
                </button>
                <button
                    onClick={() => setShowJoinModal(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    Join League
                </button>
            </div>

            {message && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-md relative mb-4" role="alert">
                    <span className="block sm:inline">{message}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setMessage('')}>
                        <svg className="fill-current h-6 w-6 text-blue-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}

            <LeagueList onSelectLeague={onSelectLeague} userId={userId} onEditRosterSettings={handleEditRosterSettings} onEditTeamProfile={handleEditTeamProfile} onDeleteLeague={handleDeleteLeague} />

            {showCreateModal && (
                <Modal title="Create New League" onClose={() => setShowCreateModal(false)}>
                    <CreateLeagueForm onCreate={handleCreateLeague} />
                </Modal>
            )}

            {showJoinModal && (
                <Modal title="Join Existing League" onClose={() => setShowJoinModal(false)}>
                    <JoinLeagueForm onJoin={handleJoinLeague} />
                </Modal>
            )}

            {showEditRosterModal && selectedLeagueForEdit && (
                <EditRosterSettingsModal
                    league={selectedLeagueForEdit}
                    onSave={handleSaveRosterSettings}
                    onClose={() => setShowEditRosterModal(false)}
                />
            )}

            {showEditTeamProfileModal && teamToEdit && (
                <EditTeamProfileModal
                    leagueId={teamToEdit.leagueId}
                    teamId={teamToEdit.teamId}
                    currentName={teamToEdit.currentName}
                    currentProfilePicture={teamToEdit.currentProfilePicture}
                    onSave={handleSaveTeamProfile}
                    onClose={() => setShowEditTeamProfileModal(false)}
                />
            )}

            {messageModalContent && typeof messageModalContent === 'object' && messageModalContent.title === "Confirm Deletion" ? (
                <ConfirmationModal
                    title={messageModalContent.title}
                    message={messageModalContent.message}
                    onConfirm={messageModalContent.onConfirm}
                    onCancel={messageModalContent.onCancel}
                />
            ) : messageModalContent && (
                <NotificationModal
                    message={messageModalContent}
                    onClose={() => setMessageModalContent(null)}
                />
            )}
        </div>
    );
};

const CreateLeagueForm = ({ onCreate }) => {
    const [leagueName, setLeagueName] = useState('');
    const [joinPassword, setJoinPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (leagueName.trim()) {
            onCreate(leagueName.trim(), joinPassword.trim() || null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
                <label htmlFor="leagueName" className="block text-gray-700 text-sm font-bold mb-2">
                    League Name:
                </label>
                <input
                    type="text"
                    id="leagueName"
                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="joinPassword" className="block text-gray-700 text-sm font-bold mb-2">
                    Join Password (Optional):
                </label>
                <input
                    type="password"
                    id="joinPassword"
                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Leave blank for no password"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
            >
                Create
            </button>
        </form>
    );
};

const JoinLeagueForm = ({ onJoin }) => {
    const [leagueName, setLeagueName] = useState('');
    const [joinPassword, setJoinPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (leagueName.trim()) {
            onJoin(leagueName.trim(), joinPassword.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
                <label htmlFor="joinLeagueName" className="block text-gray-700 text-sm font-bold mb-2">
                    League Name:
                </label>
                <input
                    type="text"
                    id="joinLeagueName"
                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="joinPassword" className="block text-gray-700 text-sm font-bold mb-2">
                    League Password (if any):
                </label>
                <input
                    type="password"
                    id="joinPassword"
                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="Enter password if required"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
            >
                Join
            </button>
        </form>
    );
};

const Modal = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 bg-white w-96 max-w-full mx-auto rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {children}
            </div>
        </div>
    );
};

const NotificationModal = ({ message, onClose }) => {
    return (
        <Modal title="Notification" onClose={onClose}>
            <p className="text-gray-700 text-center text-lg">{message}</p>
            <div className="flex justify-center mt-6">
                <button
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
};

// NEW: Add this entire component for the CSV instructions
const CsvInstructionsModal = ({ onClose, onContinue }) => {
    return (
        <Modal title="CSV File Format Instructions" onClose={onClose}>
            <div className="p-4 text-left">
                <p className="text-gray-700 mb-4">
                    To upload a custom player list, your file must be a <strong>.csv</strong> file and formatted correctly. This will replace the current player list for the league.
                </p>
                <h4 className="font-bold text-gray-800 mb-2">CSV Requirements:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        The first row of your file <strong>must</strong> be a header with the following column names in order:
                        <br />
                        <code className="bg-gray-200 p-1 rounded text-sm">name,position,team,rank</code>
                    </li>
                    <li><strong>name:</strong> The player's full name. Do not use commas in the name.</li>
                    <li><strong>position:</strong> The player's position (e.g., QB, RB, WR, TE, K, DST).</li>
                    <li><strong>team:</strong> The player's team abbreviation (e.g., KC, PHI, SF).</li>
                    <li><strong>rank:</strong> The player's unique numerical rank.</li>
                </ul>
                <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold text-gray-800 mb-2">Example:</h4>
                    <pre className="bg-gray-100 p-2 rounded-md text-sm whitespace-pre-wrap">
                        <code>
                            name,position,team,rank<br />
                            Patrick Mahomes,QB,KC,1<br />
                            Christian McCaffrey,RB,SF,2<br />
                            Baltimore Ravens,DST,BAL,150
                        </code>
                    </pre>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onContinue}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Choose File
                    </button>
                </div>
            </div>
        </Modal>
    );
};


// New ConfirmationModal component
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <Modal title={title} onClose={onCancel}>
            <p className="text-gray-700 text-center text-lg mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={onConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};


const NominatePlayerModal = ({ availablePlayers, onNominate, onClose }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    // NEW: Add state for the search term
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedPlayerId) {
            onNominate(selectedPlayerId);
            onClose();
        }
    };

    // NEW: Filter players based on the search term
    const filteredPlayers = availablePlayers.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal title="Nominate Player for Auction" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4">
                {/* NEW: Add the search bar input field */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search for a player to nominate..."
                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="playerSelect" className="block text-gray-700 text-sm font-bold mb-2">
                        Select Player:
                    </label>
                    <select
                        id="playerSelect"
                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedPlayerId}
                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                        required
                        size="10" // Make the listbox taller to show more players
                    >
                        <option value="">-- Select a player --</option>
                        {/* NEW: Map over the filtered list of players */}
                        {filteredPlayers.map(player => (
                            <option key={player.id} value={player.id}>
                                {player.name} ({player.position}) - Rank: {player.rank}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    disabled={!selectedPlayerId}
                >
                    Nominate Player
                </button>
            </form>
        </Modal>
    );
};

const EditRosterSettingsModal = ({ league, onSave, onClose }) => {
    const [settings, setSettings] = useState(league.rosterSettings || {});

    const handleChange = (position, value) => {
        setSettings(prev => ({
            ...prev,
            [position]: Math.max(0, parseInt(value, 10) || 0)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(league.id, settings);
    };

    const rosterPositions = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K', 'FLEX', 'SUPERFLEX', 'BENCH', 'bidDuration', 'intermission', 'rebidDuration'];

    return (
        <Modal title={`Edit Roster Settings for ${league.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4 grid grid-cols-2 gap-4">
                {rosterPositions.map(pos => (
                    <div key={pos} className="flex items-center justify-between">
                        <label htmlFor={pos} className="block text-gray-700 text-sm font-bold">
                            {pos}:
                        </label>
                        <input
                            type="number"
                            id={pos}
                            className="shadow appearance-none border rounded-md w-20 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center"
                            value={settings[pos] !== undefined ? settings[pos] : ''}
                            onChange={(e) => handleChange(pos, e.target.value)}
                            min="0"
                            step="1"
                        />
                    </div>
                ))}
                <div className="col-span-2 flex justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ManageMembersModal = ({ league, onClose, onKickMember, onEditBudget }) => {
    const { userId } = useFirebase();

    return (
        <Modal title={`Manage Members in ${league.name}`} onClose={onClose}>
            <div className="p-4">
                <h4 className="text-lg font-semibold mb-3">Current Members:</h4>
                <ul className="space-y-2">
                    {league.teams.map(team => (
						<li key={team.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
							<span>{team.name} ({team.id === league.adminId ? 'Admin' : 'Member'})</span>
							<div className="flex space-x-2">
								{/* This is the new button */}
								<button
									onClick={() => onEditBudget(team)}
									className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-xs"
								>
									Edit Budget
								</button>
								{team.id !== userId && (
									<button
										onClick={() => onKickMember(team.id)}
										className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md text-sm"
									>
										Kick
									</button>
								)}
							</div>
						</li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};


const EditBudgetModal = ({ team, onSave, onClose }) => {
    const [newBudget, setNewBudget] = useState(team.budget);

    const handleSubmit = (e) => {
        e.preventDefault();
        const budgetValue = parseInt(newBudget, 10);
        if (!isNaN(budgetValue) && budgetValue >= 0) {
            onSave(team.id, budgetValue);
        } else {
            alert("Please enter a valid, non-negative number for the budget.");
        }
    };

    return (
        <Modal title={`Edit Budget for ${team.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                    <label htmlFor="budget" className="block text-gray-700 text-sm font-bold mb-2">
                        New Budget:
                    </label>
                    <input
                        type="number"
                        id="budget"
                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        required
                        min="0"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                >
                    Save Budget
                </button>
            </form>
        </Modal>
    );
};

const PastRosterModal = ({ pastRosterData, onClose }) => {
    if (!pastRosterData) return null;

    const { year, teams, rosterSettings } = pastRosterData;

    // Helper to calculate total roster spots for display
    const TOTAL_ROSTER_SPOTS_PAST = Object.values(rosterSettings).reduce((sum, count) => sum + count, 0);

    return (
        <Modal title={`Roster from ${year} Draft`} onClose={onClose}>
            <div className="p-4 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-3">Roster Settings for {year}:</h3>
                <ul className="list-disc list-inside mb-4 text-sm text-gray-700 grid grid-cols-2 gap-1">
                    {Object.entries(rosterSettings).map(([pos, count]) => (
                        <li key={pos}>{pos}: {count}</li>
                    ))}
                </ul>

                <h3 className="text-lg font-semibold mb-3">Drafted Teams:</h3>
                {teams.length === 0 ? (
                    <p className="text-gray-600">No teams found for this past draft.</p>
                ) : (
                    <div className="space-y-4">
                        {teams.map(team => {
                            const totalSpent = team.roster.reduce((sum, player) => sum + (player.price || 0), 0);
                            return (
                                <div key={team.id} className="bg-gray-100 p-3 rounded-md shadow-sm border border-gray-200">
                                    <p className="font-medium text-gray-800">{team.name}</p>
                                    <p className="text-sm text-gray-600">Final Budget: ${team.budget}</p>
                                    <p className="text-sm text-gray-600">Total Spent: ${totalSpent}</p>
                                    <p className="text-sm text-gray-600 mt-2 font-semibold">Roster ({team.roster.length}/{TOTAL_ROSTER_SPOTS_PAST}):</p>
                                    {team.roster.length > 0 ? (
                                        <ul className="list-disc list-inside ml-4 text-xs text-gray-700">
                                            {team.roster.map((rosterPlayer, idx) => (
                                                <li key={idx}>
                                                    {rosterPlayer.name} ({rosterPlayer.position}) - ${rosterPlayer.price}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-500 ml-4">No players drafted.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
};

// ADDED: NEW BEER DUTY MODAL COMPONENT
const BeerDutyModal = ({ league, onSetBeerDuty, onClose }) => {
    return (
        <Modal title="Assign Beer Duty" onClose={onClose}>
            <div className="p-4">
                <h4 className="text-lg font-semibold mb-3">Select a team for Beer Duty:</h4>
                <ul className="space-y-2">
                    {league.teams.map(team => (
                        <li key={team.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                            <span>{team.name} {league.beerDutyTeamId === team.id && '(Current)'}</span>
                            <button
                                onClick={() => onSetBeerDuty(team.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded-md text-xs shadow-sm"
                                disabled={league.beerDutyTeamId === team.id}
                            >
                                Assign
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

const EditTeamProfileModal = ({ leagueId, teamId, currentName, currentProfilePicture, onSave, onClose }) => {
    const [newTeamName, setNewTeamName] = useState(currentName);
    const [profilePicturePreview, setProfilePicturePreview] = useState(currentProfilePicture);
    const [newProfilePictureFile, setNewProfilePictureFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) {
                alert("File size exceeds 500KB. Please choose a smaller image.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result);
                setNewProfilePictureFile(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setProfilePicturePreview(null);
            setNewProfilePictureFile(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) {
            alert("Team name cannot be empty.");
            return;
        }
        onSave(leagueId, teamId, newTeamName, newProfilePictureFile || currentProfilePicture);
    };

    return (
        <Modal title="Edit Team Profile" onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                    <label htmlFor="newTeamName" className="block text-gray-700 text-sm font-bold mb-2">
                        Team Name:
                    </label>
                    <input
                        type="text"
                        id="newTeamName"
                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="profilePicture" className="block w-full text-gray-700 text-sm font-bold mb-2">
                        Team Profile Picture:
                    </label>
                    <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {profilePicturePreview && (
                        <div className="mt-4 flex items-center space-x-2">
                            <img src={profilePicturePreview} alt="Profile Preview" className="w-20 h-20 rounded-full object-cover border border-gray-300" />
                            <button
                                type="button"
                                onClick={() => {
                                    setProfilePicturePreview(null);
                                    setNewProfilePictureFile(null);
                                    document.getElementById('profilePicture').value = '';
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove Picture
                            </button>
                        </div>
                    )}
                    {!profilePicturePreview && currentProfilePicture && (
                        <div className="mt-4 flex items-center space-x-2">
                            <img src={currentProfilePicture} alt="Current Profile" className="w-20 h-20 rounded-full object-cover border border-gray-300" />
                            <button
                                type="button"
                                onClick={() => {
                                    setProfilePicturePreview(null);
                                    setNewProfilePictureFile(null);
                                    document.getElementById('profilePicture').value = '';
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Remove Picture
                            </button>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    disabled={!newTeamName.trim()}
                >
                    Save Profile
                </button>
            </form>
        </Modal>
    );
};


// Helper function to pick a random available player (moved outside component)
const getRandomAvailablePlayerIndex = (players) => {
    const availablePlayerIndices = players
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => player.status === 'available')
        .map(({ index }) => index);

    if (availablePlayerIndices.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availablePlayerIndices.length);
    return availablePlayerIndices[randomIndex];
};

// Add this new component to your App.js file
const AssignPlayerModal = ({ player, team, rosterSettings, onAssign, onClose }) => {
    const getAvailableSpots = () => {
        if (!team || !player) return [];

        // --- Calculate current roster counts from players already assigned a spot ---
        const assignedCounts = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0, K: 0, FLEX: 0, SUPERFLEX: 0, BENCH: 0 };
        team.roster.forEach(p => {
            if (p.assignedSpot && p.assignedSpot !== 'UNASSIGNED' && assignedCounts[p.assignedSpot] !== undefined) {
                assignedCounts[p.assignedSpot]++;
            }
        });

        const spots = [];
        const playerPos = player.position === 'DST' ? 'DEF' : player.position;

        // 1. Primary Position Spot
        if ((rosterSettings[playerPos] || 0) > 0 && assignedCounts[playerPos] < rosterSettings[playerPos]) {
            spots.push(playerPos);
        }

        // 2. Superflex Spot
        const isSuperflexEligible = ['QB', 'RB', 'WR', 'TE'].includes(player.position);
        if (isSuperflexEligible && (rosterSettings.SUPERFLEX || 0) > 0 && assignedCounts.SUPERFLEX < rosterSettings.SUPERFLEX) {
            spots.push('SUPERFLEX');
        }
        
        // 3. Flex Spot
        const isFlexEligible = ['RB', 'WR', 'TE'].includes(player.position);
        if (isFlexEligible && (rosterSettings.FLEX || 0) > 0 && assignedCounts.FLEX < rosterSettings.FLEX) {
            spots.push('FLEX');
        }

        // 4. Bench Spot
        if ((rosterSettings.BENCH || 0) > 0 && assignedCounts.BENCH < rosterSettings.BENCH) {
            spots.push('BENCH');
        }
        
        return [...new Set(spots)];
    };

    const availableSpots = getAvailableSpots();

    return (
        <Modal title={`You Won ${player.name}!`} onClose={onClose}>
            <div className="p-4 text-center">
                <p className="text-lg text-gray-800 mb-6">
                    Assign <span className="font-bold">{player.name} ({player.position})</span> to a roster spot.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    {availableSpots.length > 0 ? availableSpots.map(spot => (
                        <button
                            key={spot}
                            onClick={() => onAssign(player.id, spot)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 shadow-md text-lg"
                        >
                            {spot}
                        </button>
                    )) : (
                        <p className="text-red-500">No available starting spots for this position.</p>
                    )}
                </div>
                 <button
                    onClick={() => onAssign(player.id, 'BENCH')}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md"
                >
                    Assign to Bench
                </button>
            </div>
        </Modal>
    );
};


const DraftScreen = ({ league, onBackToLeagueDetails }) => {
    const { db, userId, isAuthReady, isGlobalFavorite, toggleGlobalFavorite } = useFirebase();
    const [currentLeague, setCurrentLeague] = useState(league);
    const [bidAmount, setBidAmount] = useState(0);
    const [quickBid1, setQuickBid1] = useState(() => parseInt(localStorage.getItem('quickBid1') || '5', 10));
    const [remainingTime, setRemainingTime] = useState(0);
    const [intermissionTime, setIntermissionTime] = useState(0);
    const [rebidTime, setRebidTime] = useState(0);
    const [showNominatePlayerModal, setShowNominatePlayerModal] = useState(false);
    const [showManageMembersModal, setShowManageMembersModal] = useState(false);
    const [messageModalContent, setMessageModalContent] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
	const [teamToEditBudget, setTeamToEditBudget] = useState(null);
    const [sortPosition, setSortPosition] = useState('All'); // For available players list
	const [showBeerDutyModal, setShowBeerDutyModal] = useState(false); // ADDED
	const [lastBeerRequest, setLastBeerRequest] = useState(0); // ADDED	
    const [showAvailablePlayers, setShowAvailablePlayers] = useState(true); // New state for toggling available players
    const [showFavoritedPlayers, setShowFavoritedPlayers] = useState(true); // New state for toggling favorited players
    const [playersToAssign, setPlayersToAssign] = useState([]);
    const lastProcessedPlayerId = useRef(null); // Prevents re-triggering modal for the same player
    const timerRef = useRef(null);
    const intermissionTimerRef = useRef(null);
    const rebidTimerRef = useRef(null);
	const leagueRef = useRef(currentLeague);
    useEffect(() => {
        leagueRef.current = currentLeague;
    }, [currentLeague])
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    const isLeagueAdmin = currentLeague.adminId === userId;

    const REQUIRED_ROSTER_SPOTS = currentLeague.rosterSettings || {
        QB: 1, RB: 2, WR: 3, TE: 1, DEF: 1, K: 1, FLEX: 1, SUPERFLEX: 1, BENCH: 6
    };

    const TOTAL_REQUIRED_ROSTER_SLOTS = Object.values(REQUIRED_ROSTER_SPOTS).reduce((sum, count) => sum + count, 0);

    //const REBID_DURATION = 15;

    useEffect(() => {
        localStorage.setItem('quickBid1', quickBid1.toString());
    }, [quickBid1]);

    const updateLeagueInFirestore = useCallback(async (updates) => {
        if (!db || !currentLeague.id) return;
        try {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, currentLeague.id);
            await updateDoc(leagueDocRef, updates);
        } catch (e) {
            console.error("Error updating league:", e);
        }
    }, [db, currentLeague.id, appId]);


	const handleSaveBudget = async (teamId, newBudget) => {
		const updatedTeams = currentLeague.teams.map(team => 
			team.id === teamId ? { ...team, budget: newBudget } : team
		);
		await updateLeagueInFirestore({ teams: updatedTeams });
		setShowEditBudgetModal(false);
		setTeamToEditBudget(null);
		setMessageModalContent("Team budget updated successfully!");
	};
	
	const awardPlayerAndContinue = async (player, winningTeamId, price, allBids) => {
        const updatedPlayers = currentLeague.players.map(p =>
            p.id === player.id ? { ...p, status: 'taken', wonBy: winningTeamId, price, bidHistory: allBids } : p
        );

        const updatedTeams = currentLeague.teams.map(team => {
            if (team.id === winningTeamId) {
                return {
                    ...team,
                    budget: team.budget - price,
                    roster: [...team.roster, { 
                        playerId: player.id, 
                        price, 
                        name: player.name, 
                        position: player.position,
                        assignedSpot: 'UNASSIGNED' // Temporarily unassigned
                    }]
                };
            }
            return team;
        });

        const winningTeam = updatedTeams.find(t => t.id === winningTeamId);
        const newLastDraftedPlayerInfo = {
            player: { id: player.id, name: player.name, position: player.position, team: player.team },
            winningTeam: { id: winningTeam.id, name: winningTeam.name, profilePicture: winningTeam.profilePicture },
            price,
            bidHistory: allBids.map(bid => ({ ...bid, timestamp: bid.timestamp.getTime ? bid.timestamp.getTime() : bid.timestamp }))
        };

        const intermissionDuration = currentLeague.rosterSettings?.intermission || 30;
        const intermissionEndTime = new Date(Date.now() + intermissionDuration * 1000);

        await updateLeagueInFirestore({
            players: updatedPlayers,
            teams: updatedTeams,
            currentPlayerIndex: null,
            currentBid: 0,
            currentBidderId: null,
            bidEndTime: null,
            intermissionEndTime,
            status: 'intermission',
            pausedAtRemainingTime: null,
            activePlayerBids: {},
            lastDraftedPlayerInfo: newLastDraftedPlayerInfo,
            tiedBids: null,
            rebidInfo: null,
        });
        setBidAmount(0);
    };

    const handleConfirmAssignment = async (playerId, assignedSpot) => {
        const team = currentLeague.teams.find(t => t.id === userId);
        if (!team) return;

        const updatedRoster = team.roster.map(p => 
            p.playerId === playerId ? { ...p, assignedSpot } : p
        );

        const updatedTeams = currentLeague.teams.map(t => 
            t.id === userId ? { ...t, roster: updatedRoster } : t
        );
        
        await updateLeagueInFirestore({ teams: updatedTeams });

        setPlayersToAssign(prev => prev.filter(p => p.id !== playerId));
    };

    const handleRebidEnd = useCallback(async () => {
        if (currentLeague.status !== 'rebidding' || currentLeague.isPaused) return;

        const player = currentLeague.players[currentLeague.currentPlayerIndex];

        const allCurrentRebids = Object.entries(currentLeague.activePlayerBids || {}).map(([bidderId, bid]) => ({
            bidderId,
            amount: bid.amount,
            timestamp: bid.timestamp.toDate ? bid.timestamp.toDate() : bid.timestamp
        }));

        const tiedTeamIds = currentLeague.rebidInfo?.tiedTeamIds || [];
        const validRebids = allCurrentRebids.filter(bid => tiedTeamIds.includes(bid.bidderId));

        const sortedRebids = [...validRebids].sort((a, b) => b.amount - a.amount || a.timestamp.getTime() - b.timestamp.getTime());

        const intermissionDuration = 30;
        const intermissionEndTime = new Date(Date.now() + intermissionDuration * 1000);

        if (sortedRebids.length === 0 || sortedRebids[0].amount <= (currentLeague.rebidInfo?.originalTiedAmount || 0)) {
            const updatedPlayers = currentLeague.players.map(p =>
                p.id === player.id ? { ...p, status: 'available' } : p
            );
            await updateLeagueInFirestore({
                players: updatedPlayers,
                currentPlayerIndex: null,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: intermissionEndTime,
                status: 'intermission',
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                tiedBids: null,
                rebidInfo: null,
            });
            setMessageModalContent(`No valid rebids for ${player.name}. Player returned to available pool.`);
            setBidAmount(0);
            return;
        }

        const highestRebidAmount = sortedRebids[0].amount;
        const tiedRebidders = sortedRebids.filter(bid => bid.amount === highestRebidAmount);

        if (tiedRebidders.length > 1) {
            await updateLeagueInFirestore({
                status: 'tied-bid-resolution',
                currentPlayerIndex: currentLeague.currentPlayerIndex,
                tiedBids: tiedRebidders.map(b => ({ bidderId: b.bidderId, amount: b.amount, timestamp: b.timestamp })),
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: null,
                isPaused: false,
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                rebidInfo: null,
            });
            setMessageModalContent(`Another tie has occurred for ${player.name} at $${highestRebidAmount}! Admin needs to resolve.`);
            setBidAmount(0);
        } else {
            const winningBid = sortedRebids[0].amount;
            const winningTeamId = sortedRebids[0].bidderId;
            await awardPlayerAndContinue(player, winningTeamId, winningBid, allCurrentRebids);
        }
    }, [currentLeague, updateLeagueInFirestore, userId, setMessageModalContent, setBidAmount]);


    const handleBidEnd = useCallback(async () => {
        if (currentLeague.status !== 'drafting' || currentLeague.isPaused) return;

        const player = currentLeague.players[currentLeague.currentPlayerIndex];

        const allCurrentBids = Object.entries(currentLeague.activePlayerBids || {}).map(([bidderId, bid]) => ({
            bidderId,
            amount: bid.amount,
            timestamp: bid.timestamp.toDate ? bid.timestamp.toDate() : bid.timestamp
        }));

        const sortedBids = [...allCurrentBids].sort((a, b) => b.amount - a.amount || a.timestamp.getTime() - b.timestamp.getTime());

        if (sortedBids.length === 0 || sortedBids[0].amount === 0) {
            const updatedPlayers = currentLeague.players.map(p =>
                p.id === player.id ? { ...p, status: 'available' } : p
            );
            const intermissionDuration = 30;
            const intermissionEndTime = new Date(Date.now() + intermissionDuration * 1000);

            await updateLeagueInFirestore({
                players: updatedPlayers,
                currentPlayerIndex: null,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: intermissionEndTime,
                status: 'intermission',
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                tiedBids: null,
                rebidInfo: null,
            });
            setBidAmount(0);
            return;
        }

        const highestBidAmount = sortedBids[0].amount;
        const tiedBidders = sortedBids.filter(bid => bid.amount === highestBidAmount);

        if (tiedBidders.length > 1) {
	    const rebidDuration = currentLeague.rosterSettings?.rebidDuration || 15; // Add this line
	    await updateLeagueInFirestore({
	        status: 'rebidding',
	        currentPlayerIndex: currentLeague.currentPlayerIndex,
	        rebidInfo: {
	            originalTiedAmount: highestBidAmount,
	            tiedTeamIds: tiedBidders.map(b => b.bidderId),
	            rebidEndTime: new Date(Date.now() + rebidDuration * 1000) // Use the new variable
	        },
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: null,
                isPaused: false,
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                tiedBids: null,
            });
            setMessageModalContent(`A tie has occurred for ${player.name} at $${highestBidAmount}! Tied teams, please rebid.`);
            setBidAmount(0);
        } else {
            const winningBid = sortedBids[0].amount;
            const winningTeamId = sortedBids[0].bidderId;
            await awardPlayerAndContinue(player, winningTeamId, winningBid, allCurrentBids);
        }
    }, [currentLeague, updateLeagueInFirestore, userId, setMessageModalContent, setBidAmount, REBID_DURATION]);


    const handleAutoNominateNextPlayer = useCallback(async () => {
        const nextRandomPlayerIndex = getRandomAvailablePlayerIndex(currentLeague.players);

        if (nextRandomPlayerIndex !== null) {
            const bidDuration = currentLeague.rosterSettings?.bidDuration || 20;
            const bidEndTime = new Date(Date.now() + bidDuration * 1000);

            await updateLeagueInFirestore({
                status: 'drafting',
                currentPlayerIndex: nextRandomPlayerIndex,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: bidEndTime,
                intermissionEndTime: null,
                isPaused: false,
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                rebidInfo: null,
            });
        } else {
            await updateLeagueInFirestore({
                status: 'completed',
                currentPlayerIndex: null,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: null,
                isPaused: false,
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                lastDraftedPlayerInfo: null,
                rebidInfo: null,
                lastCompletedDraft: {
                    year: new Date().getFullYear(),
                    teams: currentLeague.teams.map(team => ({
                        ...team,
                        roster: team.roster.map(rosterPlayer => {
                            const fullPlayer = currentLeague.players.find(p => p.id === rosterPlayer.playerId);
                            return {
                                playerId: rosterPlayer.playerId,
                                price: rosterPlayer.price,
                                name: fullPlayer ? fullPlayer.name : 'Unknown Player',
                                position: fullPlayer ? fullPlayer.position : 'N/A'
                            };
                        })
                    })),
                    rosterSettings: currentLeague.rosterSettings,
                    completedAt: new Date(),
                }
            });
        }
    }, [currentLeague, updateLeagueInFirestore]);

	useEffect(() => {
			if (!db || !isAuthReady || !currentLeague.id) return;

			const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, currentLeague.id);
			const unsubscribe = onSnapshot(leagueDocRef, (docSnapshot) => {
				if (docSnapshot.exists()) {
					const updatedLeagueData = { id: docSnapshot.id, ...docSnapshot.data() };
					setCurrentLeague(updatedLeagueData);

					// Logic to trigger the assignment modal for the winning user
					const newLastDrafted = updatedLeagueData.lastDraftedPlayerInfo;
					if (newLastDrafted && newLastDrafted.winningTeam.id === userId && newLastDrafted.player.id !== lastProcessedPlayerId.current) {
						lastProcessedPlayerId.current = newLastDrafted.player.id;
						const userTeam = updatedLeagueData.teams.find(t => t.id === userId);
						const rosteredPlayer = userTeam.roster.find(p => p.playerId === newLastDrafted.player.id);
						if (rosteredPlayer && rosteredPlayer.assignedSpot === 'UNASSIGNED') {
							setPlayersToAssign(prev => [...prev, newLastDrafted.player]);
						}
					}
				} else {
					onBackToLeagueDetails();
				}
			});
			return () => unsubscribe();
		}, [db, isAuthReady, currentLeague.id, onBackToLeagueDetails, appId, userId]);
		
    useEffect(() => {
        if (currentLeague.status === 'drafting' && !currentLeague.isPaused && currentLeague.bidEndTime) {
            const calculateRemainingTime = () => {
                const now = Date.now();
                const endTime = currentLeague.bidEndTime.toDate ? currentLeague.bidEndTime.toDate().getTime() : currentLeague.bidEndTime.getTime();
                const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000));
                setRemainingTime(timeDiff);

                if (timeDiff <= 0) {
                    clearInterval(timerRef.current);
                    handleBidEnd();
                }
            };

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(calculateRemainingTime, 1000);
            calculateRemainingTime();

            return () => clearInterval(timerRef.current);
        } else {
            clearInterval(timerRef.current);
        }
    }, [currentLeague.status, currentLeague.isPaused, currentLeague.bidEndTime, handleBidEnd]);

    useEffect(() => {
        if (currentLeague.status === 'intermission' && !currentLeague.isPaused && currentLeague.intermissionEndTime) {
            const calculateIntermissionTime = () => {
                const now = Date.now();
                const endTime = currentLeague.intermissionEndTime.toDate ? currentLeague.intermissionEndTime.toDate().getTime() : currentLeague.intermissionEndTime.getTime();
                const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000));
                setIntermissionTime(timeDiff);

                if (timeDiff <= 0) {
                    clearInterval(intermissionTimerRef.current);
                    handleAutoNominateNextPlayer();
                }
            };

            if (intermissionTimerRef.current) {
                clearInterval(intermissionTimerRef.current);
            }
            intermissionTimerRef.current = setInterval(calculateIntermissionTime, 1000);
            calculateIntermissionTime();

            return () => clearInterval(intermissionTimerRef.current);
        } else {
            clearInterval(intermissionTimerRef.current);
        }
    }, [currentLeague.status, currentLeague.isPaused, currentLeague.intermissionEndTime, handleAutoNominateNextPlayer]);

    useEffect(() => {
        if (currentLeague.status === 'rebidding' && !currentLeague.isPaused && currentLeague.rebidInfo?.rebidEndTime) {
            const calculateRebidTime = () => {
                const now = Date.now();
                const endTime = currentLeague.rebidInfo.rebidEndTime.toDate ? currentLeague.rebidInfo.rebidEndTime.toDate().getTime() : currentLeague.rebidInfo.rebidEndTime.getTime();
                const timeDiff = Math.max(0, Math.floor((endTime - now) / 1000));
                setRebidTime(timeDiff);

                if (timeDiff <= 0) {
                    clearInterval(rebidTimerRef.current);
                    handleRebidEnd();
                }
            };

            if (rebidTimerRef.current) {
                clearInterval(rebidTimerRef.current);
            }
            rebidTimerRef.current = setInterval(calculateRebidTime, 1000);
            calculateRebidTime();

            return () => clearInterval(rebidTimerRef.current);
        } else {
            clearInterval(rebidTimerRef.current);
        }
    }, [currentLeague.status, currentLeague.isPaused, currentLeague.rebidInfo?.rebidEndTime, handleRebidEnd]);


    useEffect(() => {
        if (currentLeague.currentPlayerIndex !== null) {
            const myLastBid = currentLeague.activePlayerBids?.[userId]?.amount || 0;
            setBidAmount(myLastBid);
        } else {
            setBidAmount(0);
        }
    }, [currentLeague.currentPlayerIndex, currentLeague.activePlayerBids, userId]);

	useEffect(() => {
			// Don't run if not authenticated
			if (!isAuthReady || !userId) return;

			// This function is defined once, but gets fresh data from the ref
			const updatePresence = (isOnline) => {
				const currentLeagueData = leagueRef.current;
				const userTeamInRef = currentLeagueData.teams.find(t => t.id === userId);

				// Check if the user is on a team inside the function
				if (userTeamInRef) {
					const teamIndex = currentLeagueData.teams.findIndex(t => t.id === userId);
					const updatedTeams = [...currentLeagueData.teams];
					updatedTeams[teamIndex] = {
						...updatedTeams[teamIndex],
						isOnline: isOnline,
						lastSeen: new Date(),
					};
					updateLeagueInFirestore({ teams: updatedTeams });
				}
			};

			// Set initial online status
			updatePresence(true);

			// This interval will now run every 30 seconds without issue
			const intervalId = setInterval(() => {
				updatePresence(true);
			}, 30000);

			// This cleanup function runs when the user leaves the page
			return () => {
				clearInterval(intervalId);
				updatePresence(false);
			};
		// This stable dependency array ensures the effect only runs once
		}, [isAuthReady, userId, updateLeagueInFirestore]);



    const handleStartDraft = async () => {
        if ((currentLeague.status === 'pending' || currentLeague.status === 'lobby') && isLeagueAdmin) {
            const randomPlayerIndex = getRandomAvailablePlayerIndex(currentLeague.players);

            if (randomPlayerIndex !== null) {
                const bidDuration = 20;
                const bidEndTime = new Date(Date.now() + bidDuration * 1000);

                await updateLeagueInFirestore({
                    status: 'drafting',
                    currentPlayerIndex: randomPlayerIndex,
                    currentBid: 0,
                    currentBidderId: null,
                    bidEndTime: bidEndTime,
                    intermissionEndTime: null,
                    isPaused: false,
                    pausedAtRemainingTime: null,
                    activePlayerBids: {},
                    rebidInfo: null,
                });
            } else {
                setMessageModalContent("No players available to start the draft!");
            }
        }
    };


    const handleNominatePlayer = async (playerId) => {
        if (!isLeagueAdmin || !db || !currentLeague.id) return;

        const playerIndex = currentLeague.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1 || currentLeague.players[playerIndex].status !== 'available') {
            setMessageModalContent("Selected player is not available or does not exist.");
            return;
        }

        const bidDuration = 20;
        const bidEndTime = new Date(Date.now() + bidDuration * 1000);

        await updateLeagueInFirestore({
            status: 'drafting',
            currentPlayerIndex: playerIndex,
            currentBid: 0,
            currentBidderId: null,
            bidEndTime: bidEndTime,
            intermissionEndTime: null,
            isPaused: false,
            pausedAtRemainingTime: null,
            activePlayerBids: {},
            lastDraftedPlayerInfo: null,
            tiedBids: null,
            rebidInfo: null,
        });
        setShowNominatePlayerModal(false);
    };


    const handlePlaceBid = async (bidValue) => {
        if (currentLeague.currentPlayerIndex === null) return;

        const currentTeam = currentLeague.teams.find(t => t.id === userId);
        if (!currentTeam) {
            setMessageModalContent("You are not part of a team in this league.");
            return;
        }

        let minBidRequired = 0;
        if (currentLeague.status === 'drafting') {
            minBidRequired = 1;
        } else if (currentLeague.status === 'rebidding') {
            if (!currentLeague.rebidInfo || !currentLeague.rebidInfo.tiedTeamIds.includes(userId)) {
                setMessageModalContent("You are not eligible to bid in this rebid round.");
                return;
            }
            minBidRequired = (currentLeague.rebidInfo.originalTiedAmount || 0) + 1;
            const highestRebidSoFar = Object.values(currentLeague.activePlayerBids || {})
                                        .filter(bid => currentLeague.rebidInfo.tiedTeamIds.includes(bid.bidderId))
                                        .reduce((max, bid) => Math.max(max, bid.amount), 0);
            minBidRequired = Math.max(minBidRequired, highestRebidSoFar + 1);
        } else {
            setMessageModalContent("Bidding is not currently active.");
            return;
        }


        if (bidValue < minBidRequired && bidValue !== 0) {
            setMessageModalContent(`Your bid must be at least $${minBidRequired}.`);
            return;
        }

        if (bidValue < 0) {
            setMessageModalContent("Your bid cannot be negative.");
            return;
        }

        const positionCounts = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0, K: 0 };
        currentTeam.roster.forEach(rosterPlayer => {
            const fullPlayer = currentLeague.players.find(p => p.id === rosterPlayer.playerId);
            if (fullPlayer && positionCounts[fullPlayer.position] !== undefined) {
                positionCounts[fullPlayer.position]++;
            }
        });

        const currentRosterSize = currentTeam.roster.length;
        const totalRosterSpotsConfigured = Object.values(REQUIRED_ROSTER_SPOTS).reduce((sum, count) => sum + count, 0);

        const remainingRosterSpots = totalRosterSpotsConfigured - currentRosterSize;

        const minimumBudgetRequiredForRemainingSpots = Math.max(0, remainingRosterSpots - 1);
        const maxBidAllowed = currentTeam.budget - minimumBudgetRequiredForRemainingSpots;

        if (bidValue > maxBidAllowed) {
            setMessageModalContent(`Your bid of $${bidValue} is too high. You must reserve at least $1 for each of your remaining ${remainingRosterSpots} roster spots. Your maximum allowed bid for this player is $${maxBidAllowed}.`);
            return;
        }

        if (bidValue > currentTeam.budget) {
            setMessageModalContent("You do not have enough budget for this bid.");
            return;
        }

        const newActivePlayerBids = {
            ...(currentLeague.activePlayerBids || {}),
            [userId]: { amount: bidValue, timestamp: new Date() }
        };

        await updateLeagueInFirestore({
            activePlayerBids: newActivePlayerBids
        });
        setBidAmount(bidValue);
    };

    const handlePauseResumeDraft = async () => {
        if (!isLeagueAdmin) return;

        const now = Date.now();
        let updates = { isPaused: !currentLeague.isPaused };

        if (!currentLeague.isPaused) {
            if (currentLeague.status === 'drafting' && currentLeague.bidEndTime) {
                const currentBidEndTime = currentLeague.bidEndTime.toDate ? currentLeague.bidEndTime.toDate().getTime() : currentLeague.bidEndTime.getTime();
                const remaining = Math.max(0, Math.floor((currentBidEndTime - now) / 1000));
                updates.pausedAtRemainingTime = remaining;
                updates.bidEndTime = null;
            } else if (currentLeague.status === 'intermission' && currentLeague.intermissionEndTime) {
                const currentIntermissionEndTime = currentLeague.intermissionEndTime.toDate ? currentLeague.intermissionEndTime.toDate().getTime() : currentLeague.intermissionEndTime.getTime();
                const remaining = Math.max(0, Math.floor((currentIntermissionEndTime - now) / 1000));
                updates.pausedAtRemainingTime = remaining;
                updates.intermissionEndTime = null;
            } else if (currentLeague.status === 'rebidding' && currentLeague.rebidInfo?.rebidEndTime) {
                const currentRebidEndTime = currentLeague.rebidInfo.rebidEndTime.toDate ? currentLeague.rebidInfo.rebidEndTime.toDate().getTime() : currentLeague.rebidInfo.rebidEndTime.getTime();
                const remaining = Math.max(0, Math.floor((currentRebidEndTime - now) / 1000));
                updates.pausedAtRemainingTime = remaining;
                updates.rebidInfo = { ...currentLeague.rebidInfo, rebidEndTime: null };
            }
        } else {
            if (currentLeague.pausedAtRemainingTime !== null) {
                const newEndTime = new Date(now + currentLeague.pausedAtRemainingTime * 1000);
                if (currentLeague.status === 'drafting') {
                    updates.bidEndTime = newEndTime;
                } else if (currentLeague.status === 'intermission') {
                    updates.intermissionEndTime = newEndTime;
                } else if (currentLeague.status === 'rebidding') {
                    updates.rebidInfo = { ...currentLeague.rebidInfo, rebidEndTime: newEndTime };
                }
                updates.pausedAtRemainingTime = null;
            }
        }

        await updateLeagueInFirestore(updates);
    };

    const handleSkip = async () => {
        if (!isLeagueAdmin) return;

        if (currentLeague.status === 'intermission') {
            // If in intermission, skip directly to auto-nominate
            handleAutoNominateNextPlayer();
        } else if (currentLeague.status === 'drafting' || currentLeague.status === 'rebidding' || currentLeague.status === 'tied-bid-resolution') {
            // If in drafting or rebidding, skip current player
            let updatedPlayers = [...currentLeague.players];
            let playerToUpdate = null;

            if (currentLeague.currentPlayerIndex !== null) {
                playerToUpdate = currentLeague.players[currentLeague.currentPlayerIndex];
                updatedPlayers = currentLeague.players.map(p =>
                    p.id === playerToUpdate.id ? { ...p, status: 'available' } : p
                );
            }

            const intermissionDuration = 30;
            const intermissionEndTime = new Date(Date.now() + intermissionDuration * 1000);

            await updateLeagueInFirestore({
                players: updatedPlayers,
                currentPlayerIndex: null,
                currentBid: 0,
                currentBidderId: null,
                bidEndTime: null,
                intermissionEndTime: intermissionEndTime,
                status: 'intermission',
                pausedAtRemainingTime: null,
                activePlayerBids: {},
                lastDraftedPlayerInfo: null,
                tiedBids: null,
                rebidInfo: null,
            });
            setBidAmount(0);
        }
    };

    const handleUndoLastPick = async () => {
        if (!isLeagueAdmin || !currentLeague.lastDraftedPlayerInfo) return;

        const { player: draftedPlayer, winningTeam: originalWinningTeam, price: draftedPrice } = currentLeague.lastDraftedPlayerInfo;

        const playerToUndoIndex = currentLeague.players.findIndex(p => p.id === draftedPlayer.id);
        if (playerToUndoIndex === -1) {
            setMessageModalContent("Error: Player to undo not found in current league data.");
            return;
        }

        const updatedPlayers = currentLeague.players.map((p, index) => {
            if (index === playerToUndoIndex) {
                return { ...p, status: 'available', wonBy: null, price: null, bidHistory: [] };
            }
            return p;
        });

        const updatedTeams = currentLeague.teams.map(team => {
            if (team.id === originalWinningTeam.id) {
                return {
                    ...team,
                    budget: team.budget + draftedPrice,
                    roster: team.roster.filter(rosterPlayer => rosterPlayer.playerId !== draftedPlayer.id)
                };
            }
            return team;
        });

        const intermissionDuration = 30;
        const intermissionEndTime = new Date(Date.now() + intermissionDuration * 1000);

        await updateLeagueInFirestore({
            players: updatedPlayers,
            teams: updatedTeams,
            lastDraftedPlayerInfo: null,
            currentPlayerIndex: null,
            currentBid: 0,
            currentBidderId: null,
            bidEndTime: null,
            intermissionEndTime: intermissionEndTime,
            status: 'intermission',
            pausedAtRemainingTime: null,
            activePlayerBids: {},
            tiedBids: null,
            rebidInfo: null,
        });
        setMessageModalContent(`Successfully undid the last pick: ${draftedPlayer.name} has been returned to available players and ${originalWinningTeam.name}'s budget has been refunded.`);
    };
		
		const handleSetBeerDuty = async (teamId) => {
		await updateLeagueInFirestore({ beerDutyTeamId: teamId, beerRequests: [] });
		setShowBeerDutyModal(false);
	};

	// ADDED FUNCTION
	const handleRequestBeer = async () => {
		const FIVE_MINUTES = 5 * 60 * 1000;
		const now = Date.now();

		const lastRequestTime = parseInt(localStorage.getItem(`lastBeerRequest_${currentLeague.id}_${userId}`) || '0', 10);

		if (now - lastRequestTime < FIVE_MINUTES) {
			const timeLeft = Math.ceil((FIVE_MINUTES - (now - lastRequestTime)) / 1000 / 60);
			setMessageModalContent(`You can request a beer again in about ${timeLeft} minutes.`);
			return;
		}

		const newRequest = { requesterId: userId, timestamp: new Date() };
		const updatedRequests = [...(currentLeague.beerRequests || []), newRequest];
		await updateLeagueInFirestore({ beerRequests: updatedRequests });
        setLastBeerRequest(now); // This was missing in your paste, ensures state updates
		localStorage.setItem(`lastBeerRequest_${currentLeague.id}_${userId}`, now.toString());
		setMessageModalContent('Your beer request has been sent!');
	};

	// ADDED useEffect
	useEffect(() => {
		if (currentLeague.beerDutyTeamId === userId && currentLeague.beerRequests?.length > 0) {
			const myLastRequestTimestamp = localStorage.getItem(`lastNotifiedBeerRequest_${currentLeague.id}`) || 0;
			const latestRequest = currentLeague.beerRequests[currentLeague.beerRequests.length - 1];
			
			const latestRequestTimestamp = latestRequest.timestamp.toDate ? latestRequest.timestamp.toDate().getTime() : new Date(latestRequest.timestamp).getTime();

			if (latestRequestTimestamp > myLastRequestTimestamp) {
				const requesterTeam = currentLeague.teams.find(t => t.id === latestRequest.requesterId);
				if (requesterTeam) {
					setMessageModalContent(`🍺 ${requesterTeam.name} has requested a beer!`);
					localStorage.setItem(`lastNotifiedBeerRequest_${currentLeague.id}`, latestRequestTimestamp.toString());
				}
			}
		}
	}, [currentLeague.beerRequests, currentLeague.beerDutyTeamId, userId, currentLeague.id]);
	

    const handleKickMember = async (memberIdToKick) => {
        if (!isLeagueAdmin || memberIdToKick === userId) {
            setMessageModalContent("Admin cannot kick themselves.");
            return;
        }

        setMessageModalContent({
            title: "Confirm Kick",
            message: `Are you sure you want to kick this member? All their drafted players will be returned to the pool.`,
            onConfirm: async () => {
                let updatedMembers = currentLeague.members.filter(id => id !== memberIdToKick);
                let updatedTeams = currentLeague.teams.filter(team => team.id !== memberIdToKick);
                let updatedPlayers = [...currentLeague.players];

                const kickedTeam = currentLeague.teams.find(team => team.id === memberIdToKick);
                if (kickedTeam && kickedTeam.roster && kickedTeam.roster.length > 0) {
                    kickedTeam.roster.forEach(rosterPlayer => {
                        const playerIndex = updatedPlayers.findIndex(p => p.id === rosterPlayer.playerId);
                        if (playerIndex !== -1) {
                            updatedPlayers[playerIndex] = {
                                ...updatedPlayers[playerIndex],
                                status: 'available',
                                wonBy: null,
                                price: null,
                                bidHistory: []
                            };
                        }
                    });
                }

                let updatedActivePlayerBids = { ...currentLeague.activePlayerBids };
                if (updatedActivePlayerBids[memberIdToKick]) {
                    delete updatedActivePlayerBids[memberIdToKick];
                }

                let newCurrentBid = currentLeague.currentBid;
                let newCurrentBidderId = currentLeague.currentBidderId;

                const remainingBids = Object.entries(updatedActivePlayerBids || {}).map(([bidderId, bid]) => ({
                    bidderId,
                    amount: bid.amount,
                    timestamp: bid.timestamp.toDate ? bid.timestamp.toDate() : bid.timestamp
                }));
                const sortedRemainingBids = [...remainingBids].sort((a, b) => b.amount - a.amount || a.timestamp.getTime() - b.timestamp.getTime());

                if (sortedRemainingBids.length > 0) {
                    newCurrentBid = sortedRemainingBids[0].amount;
                    newCurrentBidderId = sortedRemainingBids[0].bidderId;
                } else {
                    newCurrentBid = 0;
                    newCurrentBidderId = null;
                }

                let newLastDraftedPlayerInfo = currentLeague.lastDraftedPlayerInfo;
                if (newLastDraftedPlayerInfo && newLastDraftedPlayerInfo.winningTeam.id === memberIdToKick) {
                    newLastDraftedPlayerInfo = null;
                }

                try {
                    await updateLeagueInFirestore({
                        members: updatedMembers,
                        teams: updatedTeams,
                        players: updatedPlayers,
                        activePlayerBids: updatedActivePlayerBids,
                        currentBid: newCurrentBid,
                        currentBidderId: newCurrentBidderId,
                        lastDraftedPlayerInfo: newLastDraftedPlayerInfo,
                        tiedBids: null,
                        rebidInfo: null,
                    });
                    setMessageModalContent(`Member ${kickedTeam ? kickedTeam.name : memberIdToKick.substring(0,4) + '...'} has been kicked out and their players returned to the pool.`);
                } catch (error) {
                    console.error("Error kicking member:", error);
                    setMessageModalContent("Failed to kick member. Please try again.");
                } finally {
                    setMessageModalContent(null);
                }
            },
            onCancel: () => setMessageModalContent(null)
        });
    };

    const handleResolveTie = async (winningTeamId) => {
        if (!isLeagueAdmin || currentLeague.status !== 'tied-bid-resolution' || !currentLeague.tiedBids || currentLeague.currentPlayerIndex === null) {
            setMessageModalContent("Cannot resolve tie in current state.");
            return;
        }

        const player = currentLeague.players[currentLeague.currentPlayerIndex];
        const winningBidAmount = currentLeague.tiedBids[0].amount;

        await awardPlayerAndContinue(player, winningTeamId, winningBidAmount, currentLeague.tiedBids);
        setMessageModalContent(`Tie resolved! ${player.name} awarded to ${winningTeamId} for $${winningBidAmount}.`);
    };
	
	// ADDED: Function to manually end the draft
    const handleCompleteDraft = async () => {
        if (!isLeagueAdmin) return;

        // This logic is similar to when the draft ends naturally
        await updateLeagueInFirestore({
            status: 'completed',
            currentPlayerIndex: null,
            currentBid: 0,
            currentBidderId: null,
            bidEndTime: null,
            intermissionEndTime: null,
            isPaused: false,
            pausedAtRemainingTime: null,
            activePlayerBids: {},
            lastDraftedPlayerInfo: null,
            rebidInfo: null,
            // This is the crucial part that saves the results
            lastCompletedDraft: {
                year: new Date().getFullYear(),
                teams: currentLeague.teams.map(team => ({
                    ...team,
                    roster: team.roster.map(rosterPlayer => {
                        const fullPlayer = currentLeague.players.find(p => p.id === rosterPlayer.playerId);
                        return {
                            playerId: rosterPlayer.playerId,
                            price: rosterPlayer.price,
                            name: fullPlayer ? fullPlayer.name : 'Unknown Player',
                            position: fullPlayer ? fullPlayer.position : 'N/A'
                        };
                    })
                })),
                rosterSettings: currentLeague.rosterSettings,
                completedAt: new Date(),
            }
        });
        setMessageModalContent("The draft has been manually completed by the admin.");
    };
	
	// ADDED: Function to export draft results to a CSV file
    const handleExportResults = () => {
        // Use lastCompletedDraft if it exists, otherwise use current league state
        const resultsSource = currentLeague.lastCompletedDraft || { teams: currentLeague.teams };
        
        if (!resultsSource.teams || resultsSource.teams.length === 0) {
            setMessageModalContent("No draft results to export.");
            return;
        }

        let csvContent = "Team Name,Player Name,Position,Price\r\n";

        resultsSource.teams.forEach(team => {
            const teamName = team.name.replace(/,/g, ""); // Remove commas from team name to prevent CSV issues
            if (team.roster && team.roster.length > 0) {
                team.roster.forEach(player => {
                    const playerName = player.name.replace(/,/g, "");
                    csvContent += `${teamName},${playerName},${player.position},${player.price}\r\n`;
                });
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${currentLeague.name}_DraftResults_${new Date().getFullYear()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const handleIncrementBid = () => {
        let newBid = bidAmount + 1;
        if (currentLeague.status === 'rebidding' && currentLeague.rebidInfo) {
            const minRebid = (currentLeague.rebidInfo.originalTiedAmount || 0) + 1;
            const highestRebidSoFar = Object.values(currentLeague.activePlayerBids || {})
                                        .filter(bid => currentLeague.rebidInfo.tiedTeamIds.includes(bid.bidderId))
                                        .reduce((max, bid) => Math.max(max, bid.amount), 0);
            newBid = Math.max(newBid, highestRebidSoFar + 1, minRebid);
        }
        handlePlaceBid(newBid);
    };

    const handleDecrementBid = () => {
        let newBid = Math.max(0, bidAmount - 1);
        if (currentLeague.status === 'rebidding' && currentLeague.rebidInfo) {
            const minRebid = (currentLeague.rebidInfo.originalTiedAmount || 0) + 1;
            newBid = Math.max(newBid, minRebid -1);
            if (newBid < minRebid && newBid !== 0) {
                newBid = minRebid;
            }
        }
        handlePlaceBid(newBid);
    };

    const handleCancelBid = () => {
        handlePlaceBid(0);
    };

    const currentPlayer = currentLeague.currentPlayerIndex !== null && currentLeague.players[currentLeague.currentPlayerIndex]
        ? currentLeague.players[currentLeague.currentPlayerIndex]
        : null;

    const userTeam = currentLeague.teams.find(t => t.id === userId);

    const availablePlayers = currentLeague.players.filter(p => p.status === 'available');

    const filteredAndSortedAvailablePlayers = availablePlayers
		.filter(player => 
			(sortPosition === 'All' || player.position === sortPosition) &&
			(player.name.toLowerCase().includes(searchTerm.toLowerCase()))
		)
		.sort((a, b) => a.rank - b.rank);

    const favoritedAndAvailablePlayers = availablePlayers
        .filter(p => isGlobalFavorite(p.id))
        .sort((a, b) => a.rank - b.rank);

    const isUserTiedBidder = currentLeague.status === 'rebidding' && currentLeague.rebidInfo?.tiedTeamIds.includes(userId);
    const minBidForCurrentUser = currentLeague.status === 'rebidding' && currentLeague.rebidInfo
        ? (currentLeague.rebidInfo.originalTiedAmount || 0) + 1
        : 1;

    const currentHighestRebid = currentLeague.status === 'rebidding' && currentLeague.rebidInfo
        ? Object.values(currentLeague.activePlayerBids || {})
            .filter(bid => currentLeague.rebidInfo.tiedTeamIds.includes(bid.bidderId))
            .reduce((max, bid) => Math.max(max, bid.amount), 0)
        : 0;

    // Get all unique positions for sorting dropdown
    const allPositions = [...new Set(currentLeague.players.map(p => p.position))].sort();


    // This is the new, complete return statement for DraftScreen
	return (
		<div className="container mx-auto p-4 font-inter bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-4 text-gray-800">Drafting in {currentLeague.name}</h2>
			<p className="text-gray-700 mb-6">League Status: <span className="font-semibold text-blue-600">{currentLeague.status.toUpperCase()}</span></p>

			{/* 1. DRAFT CONTROLS & OVERVIEW */}
			<div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
				<h3 className="text-xl font-semibold mb-4 text-gray-800">Draft Controls & Overview</h3>
				{isLeagueAdmin && (currentLeague.status === 'pending' || currentLeague.status === 'lobby') && (
                <button
                    onClick={handleStartDraft}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg mb-6"
                    disabled={availablePlayers.length === 0}
                >
                    Start Draft
                 </button>
				)}
				{isLeagueAdmin && (currentLeague.status === 'drafting' || currentLeague.status === 'intermission' || currentLeague.status === 'pending' || currentLeague.status === 'tied-bid-resolution' || currentLeague.status === 'rebidding') && (
					<div className="flex flex-wrap gap-3 mb-6">
						<button
							onClick={handlePauseResumeDraft}
							className={`font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md ${currentLeague.isPaused ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
						>
							{currentLeague.isPaused ? 'Resume Draft' : 'Pause Draft'}
						</button>
						<button
							onClick={handleSkip}
							className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
							disabled={!isLeagueAdmin || currentLeague.isPaused || currentLeague.status === 'tied-bid-resolution'}
						>
							{currentLeague.status === 'intermission' ? 'Skip Intermission' : 'Skip Player'}
						</button>
						{isLeagueAdmin && currentLeague.isPaused && availablePlayers.length > 0 && (
							<button
								onClick={() => setShowNominatePlayerModal(true)}
								className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg"
							>
								{currentLeague.status === 'intermission' ? 'Nominate Player (Override Intermission)' : 'Nominate Player'}
							</button>
						)}
						{isLeagueAdmin && (
							<>
								<button
									onClick={() => setShowManageMembersModal(true)}
									className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg"
								>
									Manage Members
								</button>
								
								<button
									onClick={() => setShowBeerDutyModal(true)}
									className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-md ...">
									Beer B!tch
								</button>
							</>
						)}
						{isLeagueAdmin && currentLeague.lastDraftedPlayerInfo && (
							<button
								onClick={handleUndoLastPick}
								className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
							>
								Undo Last Pick
							</button>

						)}
						{isLeagueAdmin && currentLeague.status !== 'completed' && (
							 <button
								onClick={() => setMessageModalContent({
									title: "Confirm End Draft",
									message: "Are you sure you want to manually end the draft? This action cannot be undone.",
									onConfirm: () => handleCompleteDraft(),
									onCancel: () => setMessageModalContent(null)
								})}
								className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
							>
								Complete Draft
							</button>
						)}						
					</div>
				)}
			</div>
			
			{/* ADDED: BEER DUTY DISPLAY AND BUTTON */}
			{currentLeague.beerDutyTeamId && (
				<div className="text-center my-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
					<p className="font-semibold text-yellow-800">
						🍺 Beer Duty: {currentLeague.teams.find(t => t.id === currentLeague.beerDutyTeamId)?.name || 'Unknown'}
					</p>
					{userId !== currentLeague.beerDutyTeamId && (
						<button
							onClick={handleRequestBeer}
							className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-sm shadow-md"
						>
							Request a Beer
						</button>
					)}
				</div>
			)}

			{/* 2. PLAYER BIDDING & STATUS AREA (MOVED UP) */}
			{(currentLeague.status === 'drafting' || currentLeague.status === 'rebidding') && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="bg-gray-50 p-6 rounded-lg shadow-inner">
						{currentLeague.lastDraftedPlayerInfo && (
							<div className="text-center bg-green-100 p-4 rounded-md mb-4 border border-green-300">
								<h3 className="text-xl font-bold text-green-700 mb-2">LAST PICK!</h3>
								<div className="flex items-center justify-center space-x-2 text-lg text-gray-800">
									{currentLeague.lastDraftedPlayerInfo.winningTeam.profilePicture && (
										<img src={currentLeague.lastDraftedPlayerInfo.winningTeam.profilePicture} alt={`${currentLeague.lastDraftedPlayerInfo.winningTeam.name} profile`} className="w-16 h-16 rounded-full object-cover" />
									)}
									<p>
										<span className="font-semibold">{currentLeague.lastDraftedPlayerInfo.player.name}</span> was drafted by{' '}
										<span className="font-semibold">{currentLeague.lastDraftedPlayerInfo.winningTeam.name}</span> for{' '}
										<span className="font-bold text-green-800">${currentLeague.lastDraftedPlayerInfo.price}</span>!
									</p>
								</div>
							</div>
						)}

						<h3 className="text-xl font-semibold mb-4 text-gray-800">
							{currentLeague.status === 'rebidding' ? 'Rebid Phase for:' : 'Current Player Up for Bid:'}
						</h3>
						{currentPlayer ? (
							<>
								<div className="flex items-center space-x-4 mb-4">
									<img
										src={currentPlayer.image}
										alt={currentPlayer.name}
										className="w-24 h-24 rounded-full object-cover border-2 border-blue-400"
										onError={(e) => e.target.src = `https://placehold.co/100x100/CCCCCC/000000?text=${currentPlayer.name.charAt(0)}`}
									/>
									<div>
										<p className="text-2xl font-bold text-gray-900">{currentPlayer.name}</p>
										<p className="text-lg text-gray-600">{currentPlayer.position} - {currentPlayer.team}</p>
										<p className="text-md text-gray-500">Rank: {currentPlayer.rank}</p>
									</div>
								</div>
								<div className="mb-4">
									{currentLeague.status === 'rebidding' ? (
										<p className="text-lg font-medium text-gray-700">Rebid Ends In: <span className="text-red-600 font-bold text-2xl">{rebidTime}s</span></p>
									) : (
										<p className="text-lg font-medium text-gray-700">Bid Ends In: <span className="text-red-600 font-bold text-2xl">{remainingTime}s</span></p>
									)}
								</div>

								{currentLeague.status === 'rebidding' && currentLeague.rebidInfo && (
									<div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded-md mb-4">
										<p className="font-semibold">Original Tied Bid: ${currentLeague.rebidInfo.originalTiedAmount}</p>
										<p className="text-sm">Minimum rebid: ${currentLeague.rebidInfo.originalTiedAmount + 1}</p>
										{currentHighestRebid > 0 && (
											<p className="text-sm">Current highest rebid: ${currentHighestRebid}</p>
										)}
									</div>
								)}

								{userTeam && (currentLeague.status === 'drafting' || isUserTiedBidder) ? (
									<div className="flex flex-col gap-4">
										<div className="flex items-center space-x-2">
											<label htmlFor="bidInput" className="block text-gray-700 font-medium">Your Bid ($):</label>
											<button
												onClick={handleDecrementBid}
												className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-md shadow-sm text-sm"
												disabled={bidAmount <= 0 || (currentLeague.status === 'rebidding' && bidAmount <= minBidForCurrentUser && bidAmount !== 0)}
											>
												-
											</button>
											<input
												type="number"
												id="bidInput"
												className="w-24 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
												value={bidAmount}
												onChange={(e) => {
													const value = parseInt(e.target.value) || 0;
													setBidAmount(value);
													handlePlaceBid(value);
												}}
												min={currentLeague.status === 'rebidding' ? minBidForCurrentUser : 0}
												step="1"
											/>
											<button
												onClick={handleIncrementBid}
												className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-2 rounded-md shadow-sm text-sm"
											>
												+
											</button>
										</div>
										<div className="text-gray-700">
											<p>Your Budget: <span className="font-bold">${userTeam.budget}</span></p>
											{(() => {
												const remainingRosterSpotsForCalc = TOTAL_REQUIRED_ROSTER_SLOTS - userTeam.roster.length;
												const maxBid = userTeam.budget - Math.max(0, remainingRosterSpotsForCalc - 1);
												return (
													<p>Your Max Bid for this player: <span className="font-bold">${maxBid}</span></p>
												);
											})()}
										</div>

										<div className="mt-4 border-t pt-4 border-gray-200">
											<h4 className="text-lg font-semibold mb-2 text-gray-800">Quick Bid Option:</h4>
											<div className="flex items-center space-x-2">
												<label htmlFor="quickBid1Input" className="sr-only">Quick Bid Amount</label>
												<input
													type="number"
													id="quickBid1Input"
													className="w-24 p-2 border border-gray-300 rounded-md text-sm"
													value={quickBid1}
													onChange={(e) => setQuickBid1(parseInt(e.target.value) || 0)}
													min="0"
													step="1"
												/>
												<button
													onClick={() => handlePlaceBid(quickBid1)}
													className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-3 rounded-md text-sm shadow-md"
													disabled={!userTeam || quickBid1 < minBidForCurrentUser || quickBid1 > userTeam.budget}
												>
													Bid ${quickBid1}
												</button>
											</div>
										</div>
										<div className="mt-4">
											<button
												onClick={handleCancelBid}
												className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
												disabled={!userTeam || bidAmount === 0}
											>
												Cancel Bid
											</button>
										</div>
									</div>
								) : (
									<p className="text-gray-600 italic">
										{currentLeague.status === 'rebidding' ? "Only tied teams can rebid in this round." : "Bidding is not active for your team right now."}
									</p>
								)}
							</>
						) : (
							<div className="text-center p-4">
								<p className="text-gray-600 text-lg mb-4">No player currently up for auction.</p>
								{isLeagueAdmin ? (
									<p className="text-gray-700 font-semibold">Admin: Nominate a player to continue the draft.</p>
								) : (
									<p className="text-gray-700 font-semibold">Waiting for the admin to nominate the next player...</p>
								)}
							</div>
						)}
					</div>
				</div>
			)}

			{currentLeague.status === 'intermission' && (
				<div className="text-center p-8 bg-blue-50 rounded-lg shadow-md mb-6">
					<h3 className="text-3xl font-bold text-blue-700 mb-4">Intermission!</h3>
					<p className="text-lg text-gray-700">Next player in: <span className="font-bold text-blue-800 text-2xl">{intermissionTime}s</span></p>
					<p className="text-gray-600 mt-2">Get ready for the next auction!</p>
					{currentLeague.lastDraftedPlayerInfo && (
						<div className="mt-6 bg-green-100 p-4 rounded-md border border-green-300">
							<h4 className="text-xl font-bold text-green-700 mb-2">Last Player Drafted:</h4>
							<div className="flex items-center justify-center space-x-2 text-lg text-gray-800">
								{currentLeague.lastDraftedPlayerInfo.winningTeam.profilePicture && (
									<img src={currentLeague.lastDraftedPlayerInfo.winningTeam.profilePicture} alt={`${currentLeague.lastDraftedPlayerInfo.winningTeam.name} profile`} className="w-16 h-16 rounded-full object-cover" />
								)}
								<p>
									<span className="font-semibold">{currentLeague.lastDraftedPlayerInfo.player.name}</span> was drafted by{' '}
									<span className="font-semibold">{currentLeague.lastDraftedPlayerInfo.winningTeam.name}</span> for{' '}
									<span className="font-bold text-green-800">${currentLeague.lastDraftedPlayerInfo.price}</span>!
								</p>
							</div>
							{currentLeague.lastDraftedPlayerInfo.bidHistory && currentLeague.lastDraftedPlayerInfo.bidHistory.length > 0 && (
								<div className="mt-4 text-left">
									<p className="font-semibold text-gray-700">All Bids:</p>
									<ul className="list-disc list-inside text-gray-600">
										{currentLeague.lastDraftedPlayerInfo.bidHistory
											.sort((a, b) => b.amount - a.amount || a.timestamp - b.timestamp)
											.map((bid, index) => {
												const bidderTeam = currentLeague.teams.find(t => t.id === bid.bidderId);
												return (
													<li key={index}>
														{bidderTeam ? bidderTeam.name : `User ${bid.bidderId.substring(0, 4)}...`}: ${bid.amount}
													</li>
												);
											})}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{currentLeague.status === 'tied-bid-resolution' && currentPlayer && (
				<div className="text-center p-8 bg-yellow-50 rounded-lg shadow-md border border-yellow-300 mb-6">
					<h3 className="text-3xl font-bold text-yellow-800 mb-4">Tie Detected!</h3>
					<p className="text-lg text-gray-700 mb-4">
						Multiple teams bid <span className="font-bold text-yellow-900">${currentLeague.tiedBids[0].amount}</span> for <span className="font-semibold">{currentPlayer.name}</span>.
					</p>
					{isLeagueAdmin ? (
						<div className="mt-6">
							<p className="text-xl font-semibold text-gray-800 mb-3">Admin: Select a winning team:</p>
							<div className="flex flex-wrap justify-center gap-4">
								{currentLeague.tiedBids.map(tiedBid => {
									const team = currentLeague.teams.find(t => t.id === tiedBid.bidderId);
									return team ? (
										<button
											key={team.id}
											onClick={() => handleResolveTie(team.id)}
											className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg"
										>
											Award to {team.name} (${tiedBid.amount})
										</button>
									) : null;
								})}
							</div>
							<button
								onClick={() => handleSkip()}
								className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
							>
								Skip Player (Discard Bids)
							</button>
						</div>
					) : (
						<p className="text-gray-700 font-semibold">Waiting for the admin to resolve the tie...</p>
					)}
				</div>
			)}

			{/* 3. LEAGUE TEAMS LIST (MOVED) */}
			<div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
				<h4 className="text-lg font-semibold mb-2 text-gray-800">League Teams:</h4>
				<ul className="space-y-2">
					{currentLeague.teams.map(team => {
						const isMyTeam = team.id === userId;
						const totalSpent = team.roster.reduce((sum, player) => sum + (player.price || 0), 0);
						const assignedCounts = { QB: 0, RB: 0, WR: 0, TE: 0, DEF: 0, K: 0, FLEX: 0, SUPERFLEX: 0, BENCH: 0 };
						const unassignedPlayers = [];
						team.roster.forEach(p => {
							if (p.assignedSpot && p.assignedSpot !== 'UNASSIGNED') {
								assignedCounts[p.assignedSpot]++;
							} else {
								unassignedPlayers.push(p);
							}
						});
						const filledSpots = { ...assignedCounts };
						const remainingRosterSpots = TOTAL_REQUIRED_ROSTER_SLOTS - team.roster.length;
						const budgetPerRemainingSpot = remainingRosterSpots > 0 ? (team.budget / remainingRosterSpots).toFixed(2) : 0;
						return (
							<li key={team.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
								<p className="font-medium text-gray-800 flex items-center">
									{(() => {
										// Consider a user offline if their last update was more than 2 minutes ago
										const TWO_MINUTES_AGO = Date.now() - (2 * 60 * 1000);
										const lastSeenTime = team.lastSeen?.toDate ? team.lastSeen.toDate().getTime() : 0;
										const isConsideredOnline = team.isOnline && lastSeenTime > TWO_MINUTES_AGO;
										
										return (
											<span 
												className={`w-3 h-3 rounded-full mr-2 flex-shrink-0 ${isConsideredOnline ? 'bg-green-500' : 'bg-red-500'}`}
												title={isConsideredOnline ? 'Online' : 'Offline'}
											></span>
										);
									})()}
									{team.profilePicture && (
										<img src={team.profilePicture} alt={`${team.name} profile`} className="w-8 h-8 rounded-full object-cover mr-2" />
									)}
									{team.name}
									<span className="text-sm text-gray-500 ml-2">({team.id.substring(0, 4)}...)</span>
								</p>
								<p className="text-sm text-gray-600">Roster: {team.roster.length} players</p>
								{isMyTeam && (
									<>
										<p className="text-sm text-gray-600">Budget: ${team.budget}</p>
										<p className="text-sm text-gray-600 font-semibold">Total Spent: ${totalSpent}</p>
										{remainingRosterSpots > 0 && (
											<p className="text-sm text-gray-600">
												Avg. Budget Left per Player: <span className="font-semibold">${budgetPerRemainingSpot}</span> <span className="text-gray-500">(for strategic planning)</span>
											</p>
										)}
										<div className="mt-2 text-xs text-gray-700">
											<p className="font-semibold">Roster Spots:</p>
											<ul className="list-disc list-inside ml-4">
												{Object.entries(filledSpots).map(([pos, count]) => (
													<li key={pos}>{pos}: {count} / {REQUIRED_ROSTER_SPOTS[pos] || 0}</li>
												))}
												{unassignedPlayers.length > 0 && (
													<li>Unassigned: {unassignedPlayers.length}</li>
												)}
											</ul>
										</div>
										{team.roster.length > 0 && (
											<div className="mt-2 text-xs text-gray-500">
												<p className="font-semibold">Roster Details:</p>
												<ul className="list-disc list-inside ml-4">
													{team.roster.map((rosterPlayer, idx) => {
														const fullPlayer = currentLeague.players.find(p => p.id === rosterPlayer.playerId);
														return (
															<li key={idx}>
																{fullPlayer ? `${fullPlayer.name} (${fullPlayer.position})` : `Unknown Player`} - ${rosterPlayer.price}
															</li>
														);
													})}
												</ul>
											</div>
										)}
									</>
								)}
							</li>
						);
					})}
				</ul>
			</div>

			{/* 4. FAVORITED PLAYERS (MOVED) */}
			{favoritedAndAvailablePlayers.length > 0 && (
				<div className="mt-6 bg-gray-100 p-6 rounded-lg shadow-inner">
					<button
						onClick={() => setShowFavoritedPlayers(!showFavoritedPlayers)}
						className={`w-full text-left font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md mb-3 ${showFavoritedPlayers ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-white'}`}
					>
						Your Favorited & Available Players {showFavoritedPlayers ? ' (Collapse)' : ' (Expand)'}
					</button>
					{showFavoritedPlayers && (
						<div className="max-h-60 overflow-y-auto bg-white p-3 rounded-md shadow-sm border border-gray-200">
							<ul className="space-y-1 text-sm text-gray-700">
								{favoritedAndAvailablePlayers.map(p => (
									<li key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
										<span>{p.name} ({p.position}) - Rank: {p.rank}</span>
										<button
											onClick={() => toggleGlobalFavorite(p.id)}
											className="ml-2 p-1 rounded-full text-red-500 hover:text-red-600"
											title="Remove from Favorites"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}

			{/* 5. AVAILABLE PLAYERS */}
			<div className="mt-6">
				<button
					onClick={() => setShowAvailablePlayers(!showAvailablePlayers)}
					className={`w-full text-left font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md mb-3 ${showAvailablePlayers ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
				>
					Available Players {showAvailablePlayers ? ' (Collapse)' : ' (Expand)'}
				</button>
				{showAvailablePlayers && (
					<>
						<div className="flex items-center space-x-2 mb-3">
							<label htmlFor="sortPosition" className="text-gray-700 text-sm font-bold">Sort by Position:</label>
							<select
								id="sortPosition"
								className="shadow appearance-none border rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								value={sortPosition}
								onChange={(e) => setSortPosition(e.target.value)}
							>
								<option value="All">All Positions</option>
								{allPositions.map(pos => (
									<option key={pos} value={pos}>{pos}</option>
								))}
							</select>
						</div>
						<div className="mb-3">
							<input
								type="text"
								placeholder="Search available players..."
								className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="max-h-60 overflow-y-auto bg-white p-3 rounded-md shadow-sm border border-gray-200">
							<ul className="space-y-1 text-sm text-gray-700">
								{filteredAndSortedAvailablePlayers.map(p => {
									const isFavorited = isGlobalFavorite(p.id);
									return (
										<li key={p.id} className="flex justify-between items-center">
											<span>{p.name} ({p.position}) - Rank: {p.rank}</span>
											<button
												onClick={() => toggleGlobalFavorite(p.id)}
												className={`ml-2 p-1 rounded-full ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
												title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
											>
												{isFavorited ? (
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
														<path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.292-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
													</svg>
												) : (
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
														<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321 1.088l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.92 10.91a.562.562 0 0 1 .32-1.088l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
													</svg>
												)}
											</button>
										</li>
									);
								})}
								{filteredAndSortedAvailablePlayers.length === 0 && (
									<li>No players currently available for this position.</li>
								)}
							</ul>
						</div>
					</>
				)}
			</div>

			{currentLeague.status === 'completed' && (
				<div className="text-center p-8 bg-green-50 rounded-lg shadow-md mt-6">
					<h3 className="text-3xl font-bold text-green-700 mb-4">Draft Completed!</h3>
					<p className="text-lg text-gray-700">All players have been drafted.</p>
					<button
                        onClick={handleExportResults}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
                    >
                        Export Draft Results
                    </button>
				</div>
			)}

			<button
				onClick={onBackToLeagueDetails}
				className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
			>
				Back to League Details
			</button>

			{showNominatePlayerModal && (
				<NominatePlayerModal
					availablePlayers={availablePlayers}
					onNominate={handleNominatePlayer}
					onClose={() => setShowNominatePlayerModal(false)}
				/>
			)}
			
			{showEditBudgetModal && teamToEditBudget && (
				<EditBudgetModal
					team={teamToEditBudget}
					onSave={handleSaveBudget}
					onClose={() => setShowEditBudgetModal(false)}
				/>
			)}
			
			{/* ADDED MODAL CALL */}
			{showBeerDutyModal && isLeagueAdmin && (
				<BeerDutyModal
					league={currentLeague}
					onSetBeerDuty={handleSetBeerDuty}
					onClose={() => setShowBeerDutyModal(false)}
				/>
			)}

			{showManageMembersModal && (
				<ManageMembersModal
					league={currentLeague}
					onClose={() => setShowManageMembersModal(false)}
					onKickMember={handleKickMember}
					onEditBudget={(team) => {
						setTeamToEditBudget(team);
						setShowEditBudgetModal(true);
					}}
				/>
			)}

			{messageModalContent && typeof messageModalContent === 'object' && messageModalContent.title === "Confirm Kick" ? (
				<ConfirmationModal
					title={messageModalContent.title}
					message={messageModalContent.message}
					onConfirm={messageModalContent.onConfirm}
					onCancel={messageModalContent.onCancel}
				/>
			) : messageModalContent && typeof messageModalContent === 'object' && messageModalContent.title === "Confirm Deletion" ? (
				<ConfirmationModal
					title={messageModalContent.title}
					message={messageModalContent.message}
					onConfirm={messageModalContent.onConfirm}
					onCancel={messageModalContent.onCancel}
				/>
			) : messageModalContent && (
				<NotificationModal
					message={messageModalContent}
					onClose={() => setMessageModalContent(null)}
				/>
			)}
			
			{playersToAssign.length > 0 && userTeam && (
				<AssignPlayerModal
					player={playersToAssign[0]}
					team={userTeam}
					rosterSettings={REQUIRED_ROSTER_SPOTS}
					onClose={() => handleConfirmAssignment(playersToAssign[0].id, 'BENCH')}
					onAssign={handleConfirmAssignment}
				/>
			)}
		</div>
	);
};
const LeagueDetailsScreen = ({ league, userId, onBackToLeagues, onStartDraft, isGlobalFavorite, toggleGlobalFavorite }) => {
    const { db, isAuthReady } = useFirebase();
    const userTeam = league.teams.find(t => t.id === userId);
    const isLeagueAdmin = league.adminId === userId;
    const [sortPosition, setSortPosition] = useState('All');
    const [messageModalContent, setMessageModalContent] = useState(null);
    
    // NEW: Add state to control the visibility of the CSV instructions modal
    const [showCsvInstructions, setShowCsvInstructions] = useState(false);
    
    const isUserReady = league.readyMembers && league.readyMembers.includes(userId);
    const allPositions = [...new Set(league.players.map(p => p.position))].sort();
    const fileInputRef = useRef(null);

    const filteredAndSortedPlayers = league.players
        .filter(player => sortPosition === 'All' || player.position === sortPosition)
        .sort((a, b) => a.rank - b.rank);
        
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
	
	// ADDED: New function for entering the draft room
    const handleEnterDraftRoom = async () => {
        if (!db || !isAuthReady || !league.id || !isLeagueAdmin) return;

		const updatedReadyMembers = [...(league.readyMembers || [])];
		if (!updatedReadyMembers.includes(userId)) {
			updatedReadyMembers.push(userId);
		}
		
		if (updatedReadyMembers.length !== league.members.length) {
			setMessageModalContent("Cant enter the draft room until all members are ready!");
			return;
		}
		
        try {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, league.id);
            // This new 'lobby' status is the trigger for everyone to navigate
            await updateDoc(leagueDocRef, { 
			status: 'lobby',
			readyMembers: updatedReadyMembers
			});
        } catch (e) {
            console.error("Error entering draft room:", e);
            setMessageModalContent("Error entering draft room. Please try again.");
        }
    };

    const handleSetReadyStatus = useCallback(async (ready) => {
        if (!db || !isAuthReady || !userId || !league.id) {
            setMessageModalContent("Firebase not ready or user not authenticated.");
            return;
        }
        try {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, league.id);
            let updatedReadyMembers = [...(league.readyMembers || [])];

            if (ready) {
                if (!updatedReadyMembers.includes(userId)) {
                    updatedReadyMembers.push(userId);
                }
            } else {
                 updatedReadyMembers = updatedReadyMembers.filter(memberId => memberId !== userId);
            }
            await updateDoc(leagueDocRef, { readyMembers: updatedReadyMembers });
            setMessageModalContent(ready ? "You are marked as ready!" : "You are no longer marked as ready.");
        } catch (e) {
            console.error("Error updating ready status:", e);
            setMessageModalContent("Error updating ready status. Please try again.");
        }
    }, [db, isAuthReady, userId, league.id, league.readyMembers, appId]);

    const handleCustomPlayerUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        if (file.type !== "text/csv") {
            setMessageModalContent("Invalid file type. Please upload a .csv file.");
            return;
        }

        setMessageModalContent("Processing CSV file...");

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                
                if (lines.length < 2) {
                    throw new Error("CSV file must have a header and at least one player row.");
                }

                const header = lines[0].split(',').map(h => h.trim());
                const requiredHeaders = ['name', 'position', 'team', 'rank'];
                if (JSON.stringify(header) !== JSON.stringify(requiredHeaders)) {
                    throw new Error(`Invalid CSV header. Must be exactly: ${requiredHeaders.join(',')}`);
                }

                const newPlayers = lines.slice(1).map((line, index) => {
                    const data = line.split(',');
                    if (data.length !== 4) {
                        throw new Error(`Row ${index + 2} has an incorrect number of columns. Expected 4.`);
                    }
                    
                    const rank = parseInt(data[3].trim(), 10);
                    if (isNaN(rank)) {
                        throw new Error(`Invalid rank on row ${index + 2}. Rank must be a number.`);
                    }

                    const name = data[0].trim();
                    const position = data[1].trim().toUpperCase();
                    const team = data[2].trim().toUpperCase();
                    
                    return {
                        id: `p${rank}`,
                        name,
                        position,
                        team,
                        rank,
                        image: `https://placehold.co/100x100/CCCCCC/000000?text=${name.substring(0, 2).toUpperCase()}`,
                        status: 'available'
                    };
                });

                const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, league.id);
                await updateDoc(leagueDocRef, { players: newPlayers });

                setMessageModalContent(`Successfully uploaded and replaced the player list with ${newPlayers.length} players!`);

            } catch (error) {
                console.error("Error processing CSV file:", error);
                setMessageModalContent(`Error: ${error.message}`);
            } finally {
                event.target.value = null;
            }
        };

        reader.onerror = () => {
             setMessageModalContent("Failed to read the file.");
        };

        reader.readAsText(file);
    };

    return (
        <div className="container mx-auto p-4 font-inter bg-white rounded-lg shadow-md">
            {/* NEW: Render the instructions modal when its state is true */}
            {showCsvInstructions && (
                <CsvInstructionsModal
                    onClose={() => setShowCsvInstructions(false)}
                    onContinue={() => {
                        setShowCsvInstructions(false);
                        fileInputRef.current.click();
                    }}
                />
            )}

            <h2 className="text-2xl font-bold mb-4 text-gray-800">League Details: {league.name}</h2>
            <p className="text-gray-700 mb-2">Admin: {league.adminId === userId ? "You" : league.adminId.substring(0, 4) + '...'}</p>
            <p className="text-gray-700 mb-4">Status: <span className="font-semibold">{league.status.toUpperCase()}</span></p>

            <div className="mb-6 p-4 bg-gray-50 rounded-md shadow-inner">
                {isLeagueAdmin ? (
                    <>
                        <p className="text-lg font-semibold text-gray-800 mb-3">
                            Ready Members: <span className="text-blue-600">{league.readyMembers ? league.readyMembers.length : 0}</span> / {league.members ? league.members.length : 0}
                        </p>
                        {league.readyMembers && league.readyMembers.length > 0 && (
                            <ul className="list-disc list-inside text-gray-700 mb-4">
                                {league.readyMembers.map(memberId => {
                                    const team = league.teams.find(t => t.id === memberId);
                                    return <li key={memberId}>{team ? team.name : `User ${memberId.substring(0,4)}...`} is ready.</li>;
                                })}
                            </ul>
                        )}
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* MODIFIED: This button now enters the lobby */}
                            <button
                                onClick={handleEnterDraftRoom}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg"
                                disabled={league.status !== 'pending'}
                            >
                                Enter Draft Room
                            </button>
                            
                            {league.status === 'pending' && (
                                <>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        onChange={handleCustomPlayerUpload}
                                        className="hidden"
                                    />
                                    <button
                                        // NEW: This button now opens the instructions modal instead of the file picker directly
                                        onClick={() => setShowCsvInstructions(true)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg"
                                    >
                                        Upload Custom Player CSV
                                    </button>
                                </>
                            )}
                        </div>
                        {league.status !== 'pending' && (
                            <p className="text-sm text-red-600 mt-2">Custom player lists can only be uploaded before the draft has started.</p>
                        )}
                    </>
                ) : (
                    <button
                        onClick={() => handleSetReadyStatus(!isUserReady)}
                        className={`font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-lg ${
                            isUserReady ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={isUserReady}
                    >
                        {isUserReady ? 'Waiting for Admin...' : 'I\'m Ready!'}
                    </button>
                )}
            </div>

            <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2 text-gray-800">All Players in League:</h4>
                <div className="flex items-center space-x-2 mb-3">
                    <label htmlFor="sortPosition" className="text-gray-700 text-sm font-bold">Sort by Position:</label>
                    <select
                        id="sortPosition"
                        className="shadow appearance-none border rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={sortPosition}
                        onChange={(e) => setSortPosition(e.target.value)}
                    >
                        <option value="All">All Positions</option>
                        {allPositions.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>
                <div className="max-h-96 overflow-y-auto bg-white p-3 rounded-md shadow-sm border border-gray-200">
                    <ul className="space-y-1 text-sm text-gray-700">
                        {filteredAndSortedPlayers.map(p => {
                            const isFavorited = isGlobalFavorite(p.id);
                            return (
                                <li key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                    <span>{p.name} ({p.position}) - Rank: {p.rank} (<span className="font-semibold">{p.status}</span>)</span>
                                    {userTeam && (
                                        <button
                                            onClick={() => toggleGlobalFavorite(p.id)}
                                            className={`ml-2 p-1 rounded-full ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                                            title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                                        >
                                            {isFavorited ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.292-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                </svg>
                                             ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321 1.088l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.92 10.91a.562.562 0 0 1 .32-1.088l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </li>
                             );
                        })}
                        {filteredAndSortedPlayers.length === 0 && (
                            <li>No players found in this league.</li>
                        )}
                    </ul>
                </div>
            </div>

            <button
                onClick={onBackToLeagues}
                className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
            >
                Back to Leagues
            </button>

            {messageModalContent && (
                <NotificationModal
                    message={messageModalContent}
                    onClose={() => setMessageModalContent(null)}
                />
            )}
        </div>
    );
};

const FavoritesScreen = ({ league, userId, onBackToLeagueDetails, isGlobalFavorite, toggleGlobalFavorite }) => {
    const favoritedPlayerIds = isGlobalFavorite; // isGlobalFavorite is a function now
    const favoritedPlayersInLeague = league.players.filter(p => favoritedPlayerIds(p.id));

    return (
        <div className="container mx-auto p-4 font-inter bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Favorite Players in {league.name}</h2>

            {favoritedPlayersInLeague.length === 0 ? (
                <p className="text-gray-600">You haven't favorited any players in this league yet.</p>
            ) : (
                <div className="max-h-96 overflow-y-auto bg-white p-3 rounded-md shadow-sm border border-gray-200">
                    <ul className="space-y-1 text-sm text-gray-700">
                        {favoritedPlayersInLeague.map(p => (
                            <li key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                <span>{p.name} ({p.position}) - Rank: {p.rank} (<span className="font-semibold">{p.status}</span>)</span>
                                <button
                                    onClick={() => toggleGlobalFavorite(p.id)}
                                    className="ml-2 p-1 rounded-full text-red-500 hover:text-red-600"
                                    title="Remove from Favorites"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={onBackToLeagueDetails}
                className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md"
            >
                Back to League Details
            </button>
        </div>
    );
};

const HomePage = ({ userId, onNavigate, isGlobalFavorite, toggleGlobalFavorite, masterPlayerList }) => {
	const [searchTerm, setSearchTerm] = useState('');
    const [sortPosition, setSortPosition] = useState('All');

    const allPositions = [...new Set(masterPlayerList.map(p => p.position))].sort();

	const filteredAndSortedPlayers = masterPlayerList
		.filter(player => 
			(sortPosition === 'All' || player.position === sortPosition) &&
			(player.name.toLowerCase().includes(searchTerm.toLowerCase()))
		)
		.sort((a, b) => a.rank - b.rank);

    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {userId}!</h2>
            <p className="text-lg text-gray-600">Get ready for your fantasy football auction draft!</p>
            <p className="mt-4 text-gray-600">Your full User ID: <span className="font-mono text-sm break-all">{userId}</span></p>

            <button
                onClick={() => onNavigate('leagues')}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 shadow-lg transform hover:scale-105"
            >
                Go to Leagues
            </button>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Global Player Pool (Favorite Players Here!):</h3>
                {masterPlayerList.length === 0 ? (
                    <p className="text-gray-600">No players available in the global pool.</p>
                ) : (
                    <>
                        <div className="flex items-center space-x-2 mb-3 justify-center">
                            <label htmlFor="homeSortPosition" className="text-gray-700 text-sm font-bold">Sort by Position:</label>
                            <select
                                id="homeSortPosition"
                                className="shadow appearance-none border rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={sortPosition}
                                onChange={(e) => setSortPosition(e.target.value)}
                            >
                                <option value="All">All Positions</option>
                                {allPositions.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                        </div>
						<div className="mb-4">
							<input
								type="text"
								placeholder="Search for a player..."
								className="shadow appearance-none border rounded-md w-full max-w-sm mx-auto py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
                        <div className="max-h-96 overflow-y-auto bg-white p-3 rounded-md shadow-sm border border-gray-200">
                            <ul className="space-y-1 text-sm text-gray-700">
                                {filteredAndSortedPlayers.map(p => {
                                    const isFavorited = isGlobalFavorite(p.id);
                                    return (
                                        <li key={p.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                                            <span>{p.name} ({p.position}) - Rank: {p.rank}</span>
                                            <button
                                                onClick={() => toggleGlobalFavorite(p.id)}
                                                className={`ml-2 p-1 rounded-full ${isFavorited ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                                                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                                            >
                                                {isFavorited ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.292-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321 1.088l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.92 10.91a.562.562 0 0 1 .32-1.088l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


const App = () => {
    const { userId, currentUserEmail, isAuthReady, auth, db, isGlobalFavorite, toggleGlobalFavorite, MASTER_PLAYER_LIST } = useFirebase();
    const [currentView, setCurrentView] = useState('home');
    const [selectedLeague, setSelectedLeague] = useState(null);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Fetch updated league data if selectedLeague changes or on initial load
    useEffect(() => {
        if (selectedLeague && db && isAuthReady) {
            const leagueDocRef = doc(db, `artifacts/${appId}/public/data/leagues`, selectedLeague.id);
            const unsubscribe = onSnapshot(leagueDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const updatedLeagueData = { id: docSnapshot.id, ...docSnapshot.data() };
                    setSelectedLeague(updatedLeagueData);

                    // MODIFIED: Now navigates on 'lobby' status as well
                    if ((updatedLeagueData.status === 'drafting' || updatedLeagueData.status === 'lobby') && currentView !== 'draft') {
                        setCurrentView('draft');
                    }

                } else {
                    console.log("Selected league no longer exists. Returning to leagues list.");
                    setSelectedLeague(null);
                    setCurrentView('leagues');
                }
            }, (error) => {
                console.error("Error fetching selected league:", error);
            });
            return () => unsubscribe();
        }
    }, [selectedLeague?.id, db, isAuthReady, appId, currentView]); // NEW: Add currentView to the dependency array

    const handleNavigate = (view) => {
        setCurrentView(view);
        if (view === 'leagues' || view === 'home') {
            setSelectedLeague(null);
        }
    };

    const handleSelectLeague = (league) => {
		setSelectedLeague(league);
		// If the draft is pending, go to the details screen.
		// Otherwise, go directly into the draft room.
		if (league.status === 'pending') {
			setCurrentView('league-details');
		} else {
			setCurrentView('draft');
		}
	};

    const handleStartDraftFromDetails = (league) => {
        setSelectedLeague(league);
        setCurrentView('draft');
    };

    const handleLogout = async () => {
        if (auth) {
            try {
                await signOut(auth);
                setCurrentView('home');
                setSelectedLeague(null);
            } catch (error) {
                console.error("Error logging out:", error);
            }
        }
    };

    if (!isAuthReady) {
        return <AuthScreen />;
    }

    if (!userId) {
        return <AuthScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-inter">
            <Header
                onNavigate={handleNavigate}
                currentView={currentView}
                currentUserEmail={currentUserEmail}
                onLogout={handleLogout}
                showFavoritesButton={selectedLeague !== null && (currentView === 'league-details' || currentView === 'draft' || currentView === 'favorites')}
            />
            <main className="container mx-auto py-8">
                {currentView === 'home' && (
                    <HomePage
                        userId={currentUserEmail || userId} /* Use email or full userId */
                        onNavigate={handleNavigate}
                        isGlobalFavorite={isGlobalFavorite}
                        toggleGlobalFavorite={toggleGlobalFavorite}
                        masterPlayerList={MASTER_PLAYER_LIST} /* Pass the master list */
                    />
                )}
                {currentView === 'leagues' && (
                    <LeaguesScreen onSelectLeague={handleSelectLeague} userId={userId} />
                )}
                {currentView === 'league-details' && selectedLeague && (
                    <LeagueDetailsScreen
                        league={selectedLeague}
                        userId={userId}
                        onBackToLeagues={() => handleNavigate('leagues')}
                        onStartDraft={handleStartDraftFromDetails}
                        isGlobalFavorite={isGlobalFavorite}
                        toggleGlobalFavorite={toggleGlobalFavorite}
                    />
                )}
                {currentView === 'draft' && selectedLeague && (
                    <DraftScreen
                        league={selectedLeague}
                        onBackToLeagueDetails={() => handleNavigate('league-details')}
                    />
                )}
                {currentView === 'favorites' && selectedLeague && (
                    <FavoritesScreen
                        league={selectedLeague}
                        userId={userId}
                        onBackToLeagueDetails={() => handleNavigate('league-details')}
                        isGlobalFavorite={isGlobalFavorite}
                        toggleGlobalFavorite={toggleGlobalFavorite}
                    />
                )}
            </main>
        </div>
    );
};

export default function AppWrapper() {
    return (
        <FirebaseProvider>
            <App />
        </FirebaseProvider>
    );
}
