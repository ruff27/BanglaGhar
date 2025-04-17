import os
from pathlib import Path

# --- Configuration ---
# No frontend base dir needed, assumes frontend files (src, public) are in the root
# where the script is run.
server_base_dir = "server"
# -------------------

# Define the relative directory structure and files to be created

# Backend structure (relative to server_base_dir)
backend_subdirs = [
    "routes",
    "controllers",
    "middleware",
    "models", # Ensure models dir is created if it doesn't exist
]

backend_files = [
    Path("routes") / "propertyRoutes.js",
    Path("routes") / "wishlistRoutes.js",
    Path("routes") / "aiRoutes.js",
    Path("routes") / "contactRoutes.js",
    Path("routes") / "adminRoutes.js",
    Path("controllers") / "propertyController.js",
    Path("controllers") / "wishlistController.js",
    Path("controllers") / "aiController.js",
    Path("controllers") / "contactController.js",
    Path("controllers") / "adminController.js",
]

# Frontend structure (relative to project root where script is run)
frontend_subdirs = [
    Path("public") / "pictures",
    Path("src") / "components" / "common",
    Path("src") / "components" / "layout",
    Path("src") / "features" / "auth" / "components",
    Path("src") / "features" / "auth" / "hooks",
    Path("src") / "features" / "home" / "components",
    Path("src") / "features" / "listing" / "components",
    Path("src") / "features" / "listing" / "hooks",
    Path("src") / "features" / "map" / "components",
    Path("src") / "features" / "map" / "hooks",
    Path("src") / "features" / "profile" / "components",
    Path("src") / "features" / "profile" / "hooks",
    Path("src") / "features" / "properties" / "components",
    Path("src") / "features" / "properties" / "hooks",
    Path("src") / "features" / "static" / "components",
    Path("src") / "features" / "static" / "hooks",
    Path("src") / "hooks",
    Path("src") / "styles",
    Path("src") / "utils",
    Path("src") / "admin" / "components",
    Path("src") / "admin" / "pages",
    Path("src") / "admin" / "hooks",
    Path("src") / "aws",
    Path("src") / "context",
    Path("src") / "i18n" / "locales",
]

frontend_files = [
    # --- src/components/common ---
    Path("src") / "components" / "common" / "LoadingSpinner.js",
    Path("src") / "components" / "common" / "ErrorDisplay.js",
    Path("src") / "components" / "common" / "ConfirmationDialog.js",
    # Note: LanguageToggle.js should be moved here later from src/components
    # --- src/components/layout ---
    Path("src") / "components" / "layout" / "Navbar.js",
    Path("src") / "components" / "layout" / "DesktopNav.js",
    Path("src") / "components" / "layout" / "MobileDrawer.js",
    Path("src") / "components" / "layout" / "ProfileMenu.js",
    Path("src") / "components" / "layout" / "PropertyTypeMenu.js",
    Path("src") / "components" / "layout" / "Footer.js",
    # --- src/context ---
    # Note: AuthContext.js should be moved here later from src/pages
    # --- src/features/auth ---
    Path("src") / "features" / "auth" / "components" / "LoginForm.js",
    Path("src") / "features" / "auth" / "components" / "SignupForm.js",
    Path("src") / "features" / "auth" / "components" / "OtpForm.js",
    Path("src") / "features" / "auth" / "components" / "ForgotPasswordForm.js",
    Path("src") / "features" / "auth" / "hooks" / "useAuthActions.js",
    # --- src/features/home ---
    Path("src") / "features" / "home" / "HomePage.js",
    Path("src") / "features" / "home" / "components" / "HeroSection.js",
    Path("src") / "features" / "home" / "components" / "HomeSearchBar.js",
    Path("src") / "features" / "home" / "components" / "FeaturedProperties.js",
    Path("src") / "features" / "home" / "components" / "HomeMapPreview.js",
    Path("src") / "features" / "home" / "components" / "CallToAction.js",
    # --- src/features/listing ---
    Path("src") / "features" / "listing" / "ListPropertyPage.js",
    Path("src") / "features" / "listing" / "hooks" / "useListingForm.js",
    Path("src") / "features" / "listing" / "components" / "Step1_Details.js",
    Path("src") / "features" / "listing" / "components" / "Step2_Location.js",
    Path("src") / "features" / "listing" / "components" / "Step3_Features.js",
    Path("src") / "features" / "listing" / "components" / "Step4_Images.js",
    Path("src") / "features" / "listing" / "components" / "Step5_Review.js",
    # --- src/features/map ---
    Path("src") / "features" / "map" / "MapPage.js",
    Path("src") / "features" / "map" / "hooks" / "useMapData.js",
    Path("src") / "features" / "map" / "components" / "MapComponent.js",
    Path("src") / "features" / "map" / "components" / "MapMarker.js",
    Path("src") / "features" / "map" / "components" / "MapPopup.js",
    Path("src") / "features" / "map" / "components" / "PropertyInfoPanel.js",
    # --- src/features/profile ---
    Path("src") / "features" / "profile" / "UserProfilePage.js",
    Path("src") / "features" / "profile" / "hooks" / "useProfileManagement.js",
    Path("src") / "features" / "profile" / "components" / "ProfileDetails.js",
    Path("src") / "features" / "profile" / "components" / "EditNameDialog.js",
    Path("src") / "features" / "profile" / "components" / "ChangePasswordDialog.js",
    Path("src") / "features" / "profile" / "components" / "DeleteAccountDialog.js",
    Path("src") / "features" / "profile" / "components" / "ProfilePictureUpload.js",
    # --- src/features/properties ---
    Path("src") / "features" / "properties" / "PropertiesPage.js",
    Path("src") / "features" / "properties" / "hooks" / "usePropertyFilters.js",
    Path("src") / "features" / "properties" / "hooks" / "useWishlist.js",
    Path("src") / "features" / "properties" / "components" / "PropertyCard.js",
    Path("src") / "features" / "properties" / "components" / "FilterSidebar.js",
    Path("src") / "features" / "properties" / "components" / "SortDropdown.js",
    Path("src") / "features" / "properties" / "components" / "PropertyDetailsDialog.js",
    Path("src") / "features" / "properties" / "components" / "WishlistButton.js",
    # --- src/features/static ---
    Path("src") / "features" / "static" / "AboutUsPage.js",
    Path("src") / "features" / "static" / "ContactPage.js",
    Path("src") / "features" / "static" / "hooks" / "useContactForm.js",
    Path("src") / "features" / "static" / "components" / "MissionSection.js",
    Path("src") / "features" / "static" / "components" / "TeamSection.js",
    Path("src") / "features" / "static" / "components" / "ValuesSection.js",
    Path("src") / "features" / "static" / "components" / "AboutCTASection.js",
    Path("src") / "features" / "static" / "components" / "ContactForm.js",
    Path("src") / "features" / "static" / "components" / "ContactInfo.js",
    # --- src/styles ---
    Path("src") / "styles" / "theme.js",
    Path("src") / "styles" / "global.css",
    # --- src/utils ---
    Path("src") / "utils" / "formatPrice.js",
    Path("src") / "utils" / "validators.js",
    # --- src/admin ---
    Path("src") / "admin" / "AdminRoutes.js",
    Path("src") / "admin" / "components" / "AdminLayout.js",
    Path("src") / "admin" / "pages" / "DashboardOverview.js",
    Path("src") / "admin" / "pages" / "ManageUsers.js",
    Path("src") / "admin" / "hooks" / "useAdminData.js",
    # --- public/pictures ---
    Path("public") / "pictures" / ".gitkeep", # Add .gitkeep to ensure dir is tracked if empty
]


# Function to create directories relative to a base path
def create_dirs(base_path_str, dir_list):
    """Creates directories relative to the base path."""
    print(f"\n--- Creating directories under ./{base_path_str} ---")
    base_path = Path(base_path_str)
    # Check if base path exists if it's not the current directory
    if base_path_str != "." and not base_path.is_dir():
        print(f"Warning: Base directory './{base_path_str}' not found. Skipping operations within it.")
        return False # Indicate failure

    for dir_path_rel in dir_list:
        # If base is '.', path is already relative to current dir
        full_path = base_path / dir_path_rel if base_path_str != "." else Path(dir_path_rel)
        try:
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"Created directory: {full_path}")
        except OSError as e:
            print(f"Error creating directory {full_path}: {e}")
    return True # Indicate success

# Function to create empty files relative to a base path
def create_files(base_path_str, file_list):
    """Creates empty files relative to the base path."""
    print(f"\n--- Creating empty files under ./{base_path_str} ---")
    base_path = Path(base_path_str)
     # Check if base path exists if it's not the current directory
    if base_path_str != "." and not base_path.is_dir():
        print(f"Warning: Base directory './{base_path_str}' not found. Skipping operations within it.")
        return False # Indicate failure

    for file_path_rel in file_list:
         # If base is '.', path is already relative to current dir
        full_path = base_path / file_path_rel if base_path_str != "." else Path(file_path_rel)
        # Ensure parent directory exists before creating file
        try:
            # Check if parent exists relative to base
            parent_dir = full_path.parent
            if not parent_dir.is_dir():
                 parent_dir.mkdir(parents=True, exist_ok=True)
                 print(f"Created parent directory for file: {parent_dir}")

            full_path.touch(exist_ok=True)
            print(f"Created file:      {full_path}")
        except OSError as e:
            print(f"Error creating file {full_path}: {e}")
        except Exception as e:
             print(f"An unexpected error occurred for file {full_path}: {e}")
    return True # Indicate success

# --- Main execution ---
if __name__ == "__main__":
    print("Starting structure creation within existing project root...")
    print(f"Backend structure will be created under './{server_base_dir}'.")
    print("Frontend structure (src, public subdirs) will be created relative to the current directory (project root).")

    # Create backend structure
    if create_dirs(server_base_dir, backend_subdirs):
        create_files(server_base_dir, backend_files)

    # Create frontend structure (relative to current directory ".")
    if create_dirs(".", frontend_subdirs): # Use "." as base for frontend dirs
        create_files(".", frontend_files)   # Use "." as base for frontend files

    print("\nSubdirectory and file skeleton creation complete.")
    print("You can now proceed with Phase 2 (moving code) from the restructuring plan.")

