using System.Threading.Tasks;

namespace OrleansService {
  public interface ITodo : Orleans.IGrainWithGuidKey {
    Task<string> SayHello (string greeting);
  }
}
