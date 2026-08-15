using Microsoft.AspNetCore.Identity;

namespace FoodApplication.Models
{
    public class AppliacationUser:IdentityUser
    {
        public string? Name { get; set; }
        public string? Address { get; set; }

    }
}
