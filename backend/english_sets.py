"""Fixed, full-length English (Communicative) practice papers.

Each set mirrors, question by question, a real CBSE paper from the 'Practice papers'
folder (2026-27 Sample Question Paper and recent Board papers): same topics, same
marks, same section order. Passages and answers are original text from this app's
bank, not copies of the CBSE papers. Order matches generate_english_pattern().
"""

SETS = [
    {"id": "sqp_2026_27", "title": "SQP 2026-27 style paper",
     "note": "Mirrors the CBSE 2026-27 Sample Question Paper: travel passage, 'Each One Teach One' notice, Reading Corner application, school library description, antibiotics letter, social harmony article.",
     "items": ["read_p1_4", "read_p2_4", "eng7_app1", "eng7_desc1", "eng7_letter1", "eng7_article1",
               "eng7_cloze1", "eng7_edit1", "eng7_jumbled1", "eng7_reported1",
               "eng7_ext_jc1", "eng7_ext_nm1",
               "eng7_2m_oz1", "eng7_2m_sp1", "eng7_2m_mp1", "eng7_2m_tg1", "eng7_2m_am1",
               "engcmp1"]},
    {"id": "board_set_a", "title": "Board Set A style paper",
     "note": "Mirrors a recent Board paper: law-and-order passage, tourism statistics, school-tour email, vehicle description, national integration letter, inclusive education article.",
     "items": ["read_p1_5", "read_p2_7", "eng7_app4", "eng7_desc2", "eng7_letter3", "eng7_article3",
               "eng7_cloze2", "eng7_edit2", "eng7_jumbled2", "eng7_reported2",
               "eng7_ext_am1", "eng7_ext_sn1",
               "eng7_2m_jc1", "eng7_2m_fn2", "eng7_2m_nm1", "eng7_2m_oz2", "eng7_2m_sp2",
               "eng7_cmp3"]},
    {"id": "board_set_b", "title": "Board Set B style paper",
     "note": "Mirrors a recent Board paper: sports passage, eco-tourism, computer-lab application, climate-change letter, girl-child education article.",
     "items": ["read_p1_6", "read_p2_5", "eng7_app2", "eng6_desc1", "eng7_letter5", "eng7_article4",
               "eng6_cloze1", "eng7_edit3", "eng7_jumbled4", "eng6_reported1",
               "eng7_ext_mp2", "eng7_ext_dd1",
               "eng7_2m_tg3", "eng7_2m_sp3", "eng7_2m_fn3", "eng7_2m_pb1", "eng7_2m_sn1",
               "eng7_cmp4"]},
    {"id": "board_set_c", "title": "Board Set C style paper",
     "note": "Mirrors a recent Board paper: rivers passage, teen screen-time data, interactive-board email, notebook description, sleep-deficit letter, renewable energy article.",
     "items": ["read_p1_7", "read_p2_6", "eng7_app3", "eng7_desc3", "eng7_letter4", "eng7_article2",
               "eng7_cloze3", "eng7_edit1", "eng7_jumbled3", "eng7_reported4",
               "eng7_ext_jc2", "eng7_ext_mp1",
               "eng7_2m_tg2", "eng7_2m_fn1", "eng7_2m_nm2", "eng7_2m_oz1", "eng7_2m_sp3",
               "eng7_cmp2"]},
]
