using FoodApplication.Models;
using System.Security.Claims;

namespace FoodApplication.Repository
{
    public interface IData
    {
        Task<AppliacationUser> GetUser(ClaimsPrincipal claims);
    }
}
