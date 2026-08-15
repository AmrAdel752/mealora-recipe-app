using FoodApplication.Models;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace FoodApplication.Repository
{
    public class Data : IData
    {
        private readonly UserManager<AppliacationUser> _userManager;
        public Data(UserManager<AppliacationUser> manager)
        {
            _userManager = manager;
        }   
        public async Task<AppliacationUser> GetUser(ClaimsPrincipal claims)
        {
            return await _userManager.GetUserAsync(claims);
        }
    }
}
