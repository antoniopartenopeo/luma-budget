# Fluid Sidebar Integration Tasks

- [ ] **1. Clean Borders** <!-- id: 0 -->
    - [ ] Remove `border-r` from `Sidebar`
    - [ ] Remove `border-b` from `TopBar`
- [ ] **2. Implement Panel Layout** <!-- id: 1 -->
    - [ ] Update `AppShell` Root Background to `bg-sidebar`
    - [ ] Update `AppShell` Content Wrapper:
        - [ ] Switch `pl-64` to `ml-64` (Crucial for background separation)
        - [ ] Add `bg-background`
        - [ ] Add `rounded-tl-[2.5rem]`
        - [ ] Add `min-h-screen`
- [ ] **3. Verification** <!-- id: 2 -->
    - [ ] Verify visual separation
    - [ ] Verify corner curve
